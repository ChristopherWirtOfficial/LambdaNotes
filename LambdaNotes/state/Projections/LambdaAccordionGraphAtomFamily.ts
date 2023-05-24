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

export const LambdaAccordionGraphAtomFamily = (lambdaBId: LambdaId) =>
  atomFamily((lambdaAId: LambdaId) =>
    atom((get) => {
      const graphA = get(LambdaPerspectiveGraphAtomFamily(lambdaAId));
      const graphB = get(LambdaPerspectiveGraphAtomFamily(lambdaBId));

      if (!graphA || !graphB) {
        // Should actually be impossible, since the atomFamily should always return a value on new lambdaIds.
        // Only real way to get here is to have a lambdaId that doesn't exist in the state ANYMORE but used to.
        throw new Error(`Graph not found for [${lambdaAId}]: ${graphA} or [${lambdaBId}]: ${graphB}`);
      }

      const pathAtoB = findPathWithVisitedChecks()(graphA, lambdaBId);
      const pathBtoA = findPathWithVisitedChecks()(graphB, lambdaAId);

      const queueA: Lambda[] = pathAtoB ?? [graphA];
      const queueB: Lambda[] = pathBtoA ?? [graphB];

      const visited = new Map<LambdaId, 'A' | 'B'>();
      visited.set(graphA.id, 'A');
      visited.set(graphB.id, 'B');

      console.log('Done trying to pathfind', {
        pathAtoB,
        pathBtoA,
      });

      // while (queueA.length && queueB.length) {
      //   const currentA = queueA.shift()!;
      //   const currentB = queueB.shift()!;

      //   if (visited.has(currentB.id) && visited.get(currentB.id) === 'A') {
      //     const pathA = findPath(graphA, currentB.id);
      //     const pathB = findPath(graphB, currentB.id);
      //     if (pathA && pathB) {
      //       con
      //     }
      //   }

      //   const currentMaxLayer = Math.max(currentA.depth, currentB.depth);
      //   const furthestKnownLayer = [...queueA, ...queueB].reduce(
      //     (acc, curr) => Math.max(acc, curr.depth, currentMaxLayer),
      //     0
      // );

      //   if (currentA.depth > furthestKnownLayer) {
      //     // Just add it back to the queue, we have more to explore in this layer across the overall queue
      //     queueA.push(currentA);
      //   } else {
      //     currentA.descriptions
      //       .map((descId) => buildGraph(get, descId, depthA + 1))
      //       .filter(Boolean)
      //       .forEach((descLambda) => {
      //         visited.set(descLambda.id, 'A');
      //         queueA.push(descLambda);
      //       });
      //   }

      //   if (depthB <= MAX_DEPTH) {
      //     currentB.descriptions
      //       .map((descId) => buildGraph(get, descId, depthB + 1))
      //       .filter(Boolean)
      //       .forEach((descLambda) => {
      //         visited.set(descLambda.id, 'B');
      //         queueB.push(descLambda);
      //       });
      //     depthB += 1;
      //   }
      // }

      // throw new Error('Paths not found');

      return graphA;
    })
  );
