import { atom, Getter } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { fetchLambdaAtom, Lambda, LambdaId } from '../atoms';

export const MAX_DEPTH = 10;

export const LambdaPerspectiveGraphAtomFamily = atomFamily((rootLambdaId: LambdaId) => {
  return atom((get) => {
    const visited = new Set<LambdaId>([rootLambdaId]);

    const checkVisitedAndExecFunc =
      <T>(func: () => T) =>
      (lambdaId: LambdaId): T | undefined => {
        if (visited.has(lambdaId)) {
          return undefined;
        } else {
          visited.add(lambdaId);
          return func();
        }
      };

    const buildGraph = (get: Getter, lambdaId: LambdaId, depth = 0): Lambda | undefined => {
      const lambdaAtom = get(fetchLambdaAtom(lambdaId));

      const lambda: Lambda = {
        id: lambdaAtom.id,
        value: lambdaAtom.value,
        depth: depth,
        description: [],
        connections: [],
      };

      if (depth > MAX_DEPTH) {
        throw new Error('Maximum depth exceeded');
      }

      // BFS for descriptions
      const descriptionIdsToRun = lambdaAtom.description.filter((descId) =>
        checkVisitedAndExecFunc(() => descId)(descId)
      );

      lambda.description = descriptionIdsToRun
        .map((descId) => buildGraph(get, descId, depth + 1))
        .filter(Boolean) as Lambda[];

      // DFS for connections
      lambda.connections = lambdaAtom.connections
        .map((connId) => checkVisitedAndExecFunc(() => buildGraph(get, connId, depth + 1))(connId))
        .filter(Boolean) as Lambda[];

      return lambda;
    };

    return buildGraph(get, rootLambdaId);
  });
});
