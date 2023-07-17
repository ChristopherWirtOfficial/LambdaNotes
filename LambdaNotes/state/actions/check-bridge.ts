import { atom } from 'jotai';
import { LambdaId, buildGraph, fetchLambdaAtom, generateCheckVisitedAndExecFunc } from '..';
import { THE_ROOT_UNIVERSE } from '../useLambdaRootUniverse';

// Helper function to check if a lambda is connected to the root universe
function checkConnectedness(rootLambda, get, visited = new Set()) {
  // The stack for DFS
  const stack = [rootLambda];

  while (stack.length) {
    const current = stack.pop();
    // Mark current node as visited
    visited.add(current.id);

    // If we've reached the root universe, return true
    if (current.id === THE_ROOT_UNIVERSE) {
      return true;
    }

    // Get the children of the current node
    const currentLambda = get(fetchLambdaAtom(current.id));
    const children = [...currentLambda.connections, ...currentLambda.descriptions];

    for (const childId of children) {
      // Only process the child if it hasn't been visited yet
      if (!visited.has(childId)) {
        stack.push(childId);
      }
    }
  }

  // If we've finished the DFS without finding the root universe, return false
  return false;
}

// Atom to check if a lambda is a bridge in the lattice
export const checkBridgeAtom = atom(undefined, (get, _set, lambdaId: LambdaId) => {
  // Get the lambda to be deleted
  const lambda = get(fetchLambdaAtom(lambdaId));
  // Get all the direct connections of the lambda
  const directConnections = [...lambda.connections, ...lambda.descriptions];

  // Generate a new root lambda for each direct connection
  const rootLambdas = directConnections.map((connectionId) => {
    // Initialize the visited set for this traversal, including the lambda to be deleted
    const visited = new Set<LambdaId>([lambdaId]);
    const checkVisitedAndExecFunc = generateCheckVisitedAndExecFunc(visited);

    // Start building the graph from the current connection
    return buildGraph({ get, lambdaId: connectionId, depth: 0, checkVisitedAndExecFunc, buildGraph });
  });

  // Perform a DFS on each root lambda to check if it can reach the root universe
  for (const rootLambda of rootLambdas) {
    if (!checkConnectedness(rootLambda, get)) {
      throw new Error(`Lambda ${lambdaId} is a bridge and cannot be safely deleted.`);
    }
  }
});
