import { atom, Getter } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { fetchLambdaAtom } from '../atoms';
import { Lambda, LambdaId, LambdaAtom } from '../types';

export type AtomFamily = typeof LambdaPerspectiveGraphAtomFamily;

export interface VirtualLambdaAtom extends LambdaAtom {
  baseId: LambdaId; // Points to the underlying LambdaAtom
  customTraversal: ProjectionFunction;
}

// Limit to prevent deep recursive traversals
export const MAX_DEPTH = 10;

// Structure to simplify argument passing
export type ContextObject = {
  get: Getter;
  lambdaId: LambdaId;
  depth: number;
  checkVisitedAndExecFunc: CheckVisitedAndExecFunc;
  buildGraph: BuildGraphFunction;
};

// Function that checks if a lambda id has been visited before, if not, it executes the provided function
export type CheckVisitedAndExecFunc = <T>(func: () => T) => (lambdaId: LambdaId) => T | undefined;

// Type for functions that create a Lambda object using the provided context
export type ProjectionFunction = (context: ContextObject) => Lambda;

// Type for functions that build a graph of interconnected Lambda objects using the provided context
export type BuildGraphFunction = (context: ContextObject) => Lambda;

// Create a Lambda object from a LambdaAtom or VirtualLambdaAtom
export const createLambdaFromAtom = (lambdaAtom: LambdaAtom, depth: number, context?: ContextObject): Lambda => {
  if ((lambdaAtom as VirtualLambdaAtom).baseId) {
    const virtualLambdaAtom = lambdaAtom as VirtualLambdaAtom;

    // Change the projection function based on the virtual lambda's customTraversal, if it exists
    const newProjectionFunction = virtualLambdaAtom.customTraversal || context?.buildGraph;

    return context
      ? newProjectionFunction({
          ...context,
          lambdaId: virtualLambdaAtom.baseId,
          depth: context.depth + 1,
          buildGraph: newProjectionFunction,
        })
      : createLambdaFromAtom(lambdaAtom, depth);
  }

  // LambdaAtom case
  return {
    id: lambdaAtom.id,
    value: lambdaAtom.value,
    depthFromRoot: depth,
    descriptions: [],
    connections: [],
  };
};

// Perform a breadth-first search (BFS) on descriptions to establish hierarchy
export const processDescriptionsBFS = (context: ContextObject): Lambda | undefined => {
  const descLambdaAtom = context.get(fetchLambdaAtom(context.lambdaId));
  const descriptionLambda: Lambda = createLambdaFromAtom(descLambdaAtom, context.depth);
  descriptionLambda.descriptions = descLambdaAtom.descriptions
    .filter((innerDescId) => context.checkVisitedAndExecFunc(() => true)(innerDescId))
    .map((innerDescId) => processDescriptionsBFS({ ...context, lambdaId: innerDescId, depth: context.depth + 1 }))
    .filter(Boolean) as Lambda[];
  return descriptionLambda;
};

// Process connections for each Lambda using a depth-first search (DFS)
export const processConnectionsDFS = (lambda: Lambda, context: ContextObject): Lambda | undefined => {
  const connLambdaAtom = context.get(fetchLambdaAtom(lambda.id));
  lambda.connections = connLambdaAtom.connections
    .filter((connId) => context.checkVisitedAndExecFunc(() => true)(connId))
    .map((connId) => context.buildGraph({ ...context, lambdaId: connId, depth: context.depth + 1 }))
    .filter(Boolean) as Lambda[];

  // Process descriptions within each connection
  lambda.descriptions.forEach((descriptionLambda) => processConnectionsDFS(descriptionLambda, context));

  return lambda;
};

// Build the graph of interconnected Lambda objects
const buildGraph: BuildGraphFunction = (context) => {
  const lambdaAtom = context.get(fetchLambdaAtom(context.lambdaId));

  if ((lambdaAtom as VirtualLambdaAtom).baseId) {
    const virtualLambdaAtom = lambdaAtom as VirtualLambdaAtom;

    // Change the projection function based on the virtual lambda's customTraversal, if it exists
    const newProjectionFunction = virtualLambdaAtom.customTraversal || context.buildGraph;

    return buildGraph({
      ...context,
      lambdaId: virtualLambdaAtom.baseId,
      depth: context.depth + 1,
      buildGraph: newProjectionFunction,
    });
  }

  return defaultProjectionFunction(context);
};

// Default function to create a Lambda object
export const defaultProjectionFunction: ProjectionFunction = (context) => {
  const lambdaAtom = context.get(fetchLambdaAtom(context.lambdaId));
  const lambda = createLambdaFromAtom(lambdaAtom, context.depth);

  // Prevent excessive depth
  if (context.depth > MAX_DEPTH) {
    throw new Error('Maximum depth exceeded');
  }

  lambda.descriptions = lambdaAtom.descriptions
    .filter((descId) => context.checkVisitedAndExecFunc(() => true)(descId))
    .map((descId) => processDescriptionsBFS({ ...context, lambdaId: descId }))
    .filter(Boolean) as Lambda[];

  // Process connections within each description
  processConnectionsDFS(lambda, context);

  return lambda;
};

// Jotai atom family representing a hypergraph of interconnected concepts (a Lambda Lattice) from the perspective of a given Lambda
export const LambdaPerspectiveGraphAtomFamily = atomFamily((rootLambdaId: LambdaId) => {
  return atom((get) => {
    // Track visited lambdas to prevent cycles
    const visited = new Set<LambdaId>([rootLambdaId]);
    const checkVisitedAndExecFunc: CheckVisitedAndExecFunc =
      <T>(func: () => T) =>
      (lambdaId: LambdaId): T | undefined => {
        if (visited.has(lambdaId)) {
          return undefined;
        } else {
          visited.add(lambdaId);
          return func();
        }
      };

    // Begin building the graph from the root
    const newRootLambda = buildGraph({ get, lambdaId: rootLambdaId, depth: 0, checkVisitedAndExecFunc, buildGraph });

    if (!newRootLambda) {
      throw new Error(`Error generating a Root Lambda projection for ${rootLambdaId}`);
    }

    return newRootLambda;
  });
});
