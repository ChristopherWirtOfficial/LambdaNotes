import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { LambdaPerspectiveGraphAtomFamily } from '../atoms';
import { Lambda, LambdaId } from '../types';

// Should never be reached - by the time this is reached, the pathfinding should have already been done
//  or we would have run out of nodes to visit. If we truly have a node that can only be reached by going through
//  100 unvisited nodes, then we want to throw an error tbh.
const MAX_DEPTH = 100;

const findPathWithVisitedChecks = () => {
  const visited = new Map<LambdaId, boolean>();

  const findPath = (lambda: Lambda, targetId: LambdaId, depth = 0): Lambda[] | null => {
    if (depth > MAX_DEPTH) {
      throw new Error('Maximum depth exceeded');
    }

    if (visited.has(lambda.id)) {
      return null;
    }

    visited.set(lambda.id, true);

    // Base case: if the target node is found, return the path containing only this node
    if (lambda.id === targetId) {
      return [lambda];
    }

    // Recursive case: try to find the target node in the descriptions
    const descriptionPath = lambda.descriptions
      .map((description) => findPath(description, targetId, depth + 1))
      .find(Boolean) as Lambda[];

    // If a path is found in descriptions, return it prepended with the current node
    if (descriptionPath !== undefined) {
      return [lambda, ...descriptionPath];
    }

    // If the target node was not found in the descriptions, try the connections
    const connectionPath = lambda.connections
      .map((connection) => findPath(connection, targetId, depth + 1))
      .find(Boolean) as Lambda[];

    // If a path is found in connections, return it prepended with the current node
    if (connectionPath !== undefined) {
      return [lambda, ...connectionPath];
    }

    // If the target node was not found in either the descriptions or connections, return null
    return null;
  };

  return findPath;
};
const middlePathIndex = (path) => {
  if (!path) return null;
  return Math.floor(path.length / 2);
};

export const LambdaAccordionGraphAtomFamily = (lambdaBId: LambdaId) =>
  atomFamily((lambdaAId: LambdaId) =>
    atom((get) => {
      const graphA = get(LambdaPerspectiveGraphAtomFamily(lambdaAId));
      const graphB = get(LambdaPerspectiveGraphAtomFamily(lambdaBId));

      if (!graphA || !graphB) {
        throw new Error(`Graph not found for [${lambdaAId}]: ${graphA} or [${lambdaBId}]: ${graphB}`);
      }

      const pathAtoB = findPathWithVisitedChecks()(graphA, lambdaBId);
      const pathBtoA = findPathWithVisitedChecks()(graphB, lambdaAId);

      console.log('find path', { pathAtoB, pathBtoA });

      if (!pathAtoB || !pathBtoA) {
        throw new Error(`Bi-directional path(s) not found between [${lambdaAId}] and [${lambdaBId}]`);
      }

      const midA = middlePathIndex(pathAtoB);
      const midB = middlePathIndex(pathBtoA);

      if (midA === null || midB === null) {
        throw new Error(`Paths not found between [${lambdaAId}] and [${lambdaBId}]`);
      }

      const queueA: Lambda[] = [pathAtoB[midA]];
      const queueB: Lambda[] = [pathBtoA[midB]];

      const visited = new Map<LambdaId, 'A' | 'B'>();
      visited.set(queueA[0].id, 'A');
      visited.set(queueB[0].id, 'B');

      // TODO: BFS from each side by alternating between the two queues to form an exhaustive accordion graph that contains ALL nodes in the lattice (since A and B are both fully connected to the lattice, bi-directionally)

      return graphA; // TODO: return the constructed accordion graph
    })
  );
