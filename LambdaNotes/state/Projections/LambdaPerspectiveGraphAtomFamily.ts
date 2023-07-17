import { atom, Getter } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { fetchLambdaAtom } from '../atoms';
import { Lambda, LambdaId, LambdaAtom } from '../types';

// The maximum depth allowed for recursion to avoid infinite loops or call stack overflow
export const MAX_DEPTH = 10;

export interface VirtualLambdaAtom extends LambdaAtom {
  baseId: LambdaId; // Points to the underlying static LambdaAtom
  customTraversal: ProjectionFunction; // Optional custom traversal function
  DEBUG_NAME?: string; // This is ONLY for debugging purposes, and should NEVER be used semantically or to pass information across layers
  DEBUG_VIRTUAL_TYPE?: string; // Same as above.
}

// Structure to simplify argument passing
export type ContextObject = {
  get: Getter;
  lambdaId: LambdaId;
  depth: number;
  checkVisitedAndExecFunc: CheckVisitedAndExecFunc;
  buildGraph: ProjectionFunction;
};

// Function that checks if a lambda id has been visited before, if not, it executes the provided function
// This prevents cycles in the graph traversal by making sure every node is visited only once
export type CheckVisitedAndExecFunc = <T>(func: () => T) => (lambdaId: LambdaId) => T | undefined;

// Type for functions that create a Lambda object using the provided context
// These functions are key for enabling virtual lambdas with their own custom traversal logic
export type ProjectionFunction = (context: ContextObject) => Lambda;

// This function is responsible for creating Lambda objects from LambdaAtoms
// If a VirtualLambdaAtom is encountered, the customTraversal function is used if it exists
export const createLambdaFromAtom = <T extends LambdaAtom | VirtualLambdaAtom>(
  lambdaAtom: T,
  depth: number,
  context?: ContextObject
): Lambda => {
  // If this atom is a virtual lambda, we use its customTraversal function
  if ((lambdaAtom as VirtualLambdaAtom).baseId) {
    const virtualLambdaAtom = lambdaAtom as VirtualLambdaAtom;

    // Change the projection function based on the virtual lambda's customTraversal, if it exists
    const newProjectionFunction = virtualLambdaAtom.customTraversal || context?.buildGraph;

    // Call the new projection function
    return context
      ? newProjectionFunction({
          ...context,
          lambdaId: virtualLambdaAtom.baseId,
          depth: context.depth + 1,
          buildGraph: newProjectionFunction,
        })
      : // NOTE: I don't think this makes any sense, since it would just keep calling this function with this `lambdaAtom` over and over again
        createLambdaFromAtom(lambdaAtom, depth);
  }

  // Non-virtual LambdaAtom case
  return {
    id: lambdaAtom.id,
    value: lambdaAtom.value,
    depthFromRoot: depth,
    descriptions: [],
    connections: [],
  };
};

// Perform a breadth-first search (BFS) on descriptions to establish hierarchy
// The BFS approach guarantees that all descriptions of a lambda are processed before moving onto connections
// This establishes the hierarchical nature of descriptions, and also means the traversal respects the asymmetric
// nature of descriptions being viewed first
export const processDescriptionsBFS = (context: ContextObject): Lambda | undefined => {
  // Get the LambdaAtom for the current id
  const descLambdaAtom = context.get(fetchLambdaAtom(context.lambdaId));

  // Create a Lambda object from the atom
  const descriptionLambda: Lambda = createLambdaFromAtom(descLambdaAtom, context.depth);

  // Assign descriptions by recursively processing each one
  descriptionLambda.descriptions = descLambdaAtom.descriptions
    .filter((innerDescId) => context.checkVisitedAndExecFunc(() => true)(innerDescId))
    .map((innerDescId) => processDescriptionsBFS({ ...context, lambdaId: innerDescId, depth: context.depth + 1 }))
    .filter(Boolean) as Lambda[];

  // Return the newly created Lambda object with its descriptions
  return descriptionLambda;
};

// Process connections for each Lambda using a depth-first search (DFS)
// DFS is used to ensure every connection is fully explored before moving onto the next one
export const processConnectionsDFS = (lambda: Lambda, context: ContextObject): Lambda | undefined => {
  // Get the LambdaAtom for the current id
  const connLambdaAtom = context.get(fetchLambdaAtom(lambda.id));

  // Assign connections by recursively processing each one
  lambda.connections = connLambdaAtom.connections
    .filter((connId) => context.checkVisitedAndExecFunc(() => true)(connId))
    .map((connId) => context.buildGraph({ ...context, lambdaId: connId, depth: context.depth + 1 }))
    .filter(Boolean) as Lambda[];

  // Process descriptions within each connection
  lambda.descriptions.forEach((descriptionLambda) => processConnectionsDFS(descriptionLambda, context));

  // Return the Lambda object with its connections processed
  return lambda;
};

// Build the graph of interconnected Lambda objects
export const buildGraph: ProjectionFunction = (context) => {
  // Get the LambdaAtom for the current id
  const lambdaAtom = context.get(fetchLambdaAtom(context.lambdaId));

  // If this atom is a virtual lambda, we use its customTraversal function
  if ((lambdaAtom as VirtualLambdaAtom).baseId) {
    const virtualLambdaAtom = lambdaAtom as VirtualLambdaAtom;

    // Change the projection function based on the virtual lambda's customTraversal, if it exists
    const newProjectionFunction = virtualLambdaAtom.customTraversal || context.buildGraph;

    // Call the new projection function
    return buildGraph({
      ...context,
      lambdaId: virtualLambdaAtom.baseId,
      depth: context.depth + 1,
      buildGraph: newProjectionFunction,
    });
  }

  // Call the default projection function for non-virtual lambdas
  return defaultProjectionFunction(context);
};

// Default function to create a Lambda object
// This function processes descriptions with BFS and connections with DFS to ensure full traversal and establish hierarchy
export const defaultProjectionFunction: ProjectionFunction = (context) => {
  // Get the LambdaAtom for the current id
  const lambdaAtom = context.get(fetchLambdaAtom(context.lambdaId));

  // Create a Lambda object from the atom
  const lambda = createLambdaFromAtom(lambdaAtom, context.depth);

  // Prevent excessive depth
  if (context.depth > MAX_DEPTH) {
    throw new Error('Maximum depth exceeded');
  }

  // Process descriptions using BFS
  lambda.descriptions = lambdaAtom.descriptions
    .filter((descId) => context.checkVisitedAndExecFunc(() => true)(descId))
    .map((descId) => processDescriptionsBFS({ ...context, lambdaId: descId }))
    .filter(Boolean) as Lambda[];

  // Process connections within each description using DFS
  processConnectionsDFS(lambda, context);

  // Return the Lambda object with its descriptions and connections processed
  return lambda;
};

// Higher-order function to generate a function that checks if a value is in a set
// and executes a function if it is not
export const generateCheckVisitedAndExecFunc = (visited: Set<LambdaId>): CheckVisitedAndExecFunc => {
  return <T>(func: () => T) =>
    (lambdaId: LambdaId): T | undefined => {
      if (visited.has(lambdaId)) {
        return undefined;
      } else {
        visited.add(lambdaId);
        return func();
      }
    };
};

// Jotai atom family representing a hypergraph of interconnected concepts (a Lambda Lattice) from the perspective of a given Lambda
// This atom family is the key to constructing projections of the lambda lattice
export const LambdaPerspectiveGraphAtomFamily = atomFamily((rootLambdaId: LambdaId) => {
  return atom((get) => {
    // Track visited lambdas to prevent cycles
    const visited = new Set<LambdaId>([rootLambdaId]);

    // Function that checks if a lambda has been visited before, if not, it executes the provided function
    const checkVisitedAndExecFunc = generateCheckVisitedAndExecFunc(visited);

    // Begin building the graph from the root
    const newRootLambda = buildGraph({ get, lambdaId: rootLambdaId, depth: 0, checkVisitedAndExecFunc, buildGraph });

    if (!newRootLambda) {
      throw new Error(`Error generating a Root Lambda projection for ${rootLambdaId}`);
    }

    // The root of the graph representing the perspective of the given lambda
    return newRootLambda;
  });
});
