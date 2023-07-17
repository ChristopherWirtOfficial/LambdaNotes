import { atom, Getter } from 'jotai';
import { Lambda, LambdaId, LambdaPerspectiveGraphAtomFamily } from '..';
import { THE_ROOT_UNIVERSE } from '../useLambdaRootUniverse';

// Helper function to check if a lambda is connected to the root universe
function checkConnectedness(rootLambda: Lambda, get: Getter, visited = new Set<LambdaId>()) {
  // The stack for DFS
  const stack = [rootLambda];

  while (stack.length) {
    const current = stack.pop()!;
    // Mark current node as visited
    visited.add(current.id);

    // If we've reached the root universe, return true
    if (current.id === THE_ROOT_UNIVERSE) {
      return true;
    }

    // Get the children of the current node
    const children = [...current.connections, ...current.descriptions];

    for (const child of children) {
      // Only process the child if it hasn't been visited yet
      if (!visited.has(child.id)) {
        stack.push(child);
      }
    }
  }

  // If we've finished the DFS without finding the root universe, return false
  return false;
}

// Atom to check if a lambda is a bridge in the lattice
export const checkBridgeAtom = atom(undefined, (get, _set, lambdaId: LambdaId) => {
  // Get the lambda perspective graph for the lambda to be deleted
  const lambda = get(LambdaPerspectiveGraphAtomFamily(lambdaId));
  // Get all the direct connections of the lambda
  const directConnections = [...lambda.connections, ...lambda.descriptions];

  // Perform a DFS on each root lambda to check if it can reach the root universe
  for (const rootLambda of directConnections) {
    if (!checkConnectedness(rootLambda, get, new Set<LambdaId>([lambdaId]))) {
      throw new Error(`Lambda ${lambdaId} is a bridge and cannot be safely deleted.`);
    }
  }
});
