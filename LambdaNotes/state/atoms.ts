import { Getter, atom } from 'jotai';
import { atomFamily, selectAtom } from 'jotai/utils';

export type LambdaId = string;

export interface Lambda {
  id: LambdaId;
  value: string;
  depth: number;
  description: Lambda[];
  connections: Lambda[];
}

export interface LambdaAtom {
  id: LambdaId;
  value: string;
  depth?: number;
  description: LambdaId[]; // ids of description Lambdas
  connections: LambdaId[]; // ids of connected Lambdas
}

// An atom family that stores every single lambda in the universe
export const LambdaUniverseAtomFamily = atomFamily((id: LambdaId) =>
  atom<LambdaAtom>({
    id,
    value: '***NEVER SEEN***',
    description: [],
    connections: [],
  })
);

const MAX_DEPTH = 10;

// This atomFamily creates a unidirectional graph of lambdas connected to a given lambda, recursively.
// Each lambda is represented exactly once and any connections to other lambdas are represented by their own lambda atoms.
// In case a lambda exists elsewhere in the graph already, its id is used for reference, avoiding duplication.
export const LambdaPerspectiveGraphAtomFamily = atomFamily((rootLambdaAtom: LambdaAtom) => {
  // This set stores all the visited lambda IDs.

  return atom((get) => {
    const visited = new Set<LambdaId>();

    const buildGraph = (get: Getter, lambdaId: LambdaId, depth = 0) => {
      const lambdaAtom = get(selectAtom(LambdaUniverseAtomFamily(lambdaId), (v) => v));

      // If this node has already been visited, we stop traversing this path.
      if (visited.has(lambdaAtom.id)) {
        return undefined;
      }

      const lambda: Lambda = {
        id: lambdaAtom.id,
        value: lambdaAtom.value,
        depth: depth,
        description: [],
        connections: [],
      };

      // Mark the current node as visited.
      visited.add(lambdaAtom.id);

      if (depth > MAX_DEPTH) {
        throw new Error('Maximum depth exceeded');
      }

      lambda.description = lambdaAtom.description
        .map((descId: string) => buildGraph(get, descId, depth + 1))
        .filter(Boolean) as Lambda[]; // filter out undefined nodes

      lambda.connections = lambdaAtom.connections
        .map((connId: string) => buildGraph(get, connId, depth + 1))
        .filter(Boolean) as Lambda[]; // filter out undefined nodes

      return lambda;
    };

    return buildGraph(get, rootLambdaAtom.id);
  });
});
