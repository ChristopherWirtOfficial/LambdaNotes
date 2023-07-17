import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { LambdaPerspectiveGraphAtomFamily, descriptionsProjection, fetchLambdaAtom } from '../atoms';

import { Lambda, LambdaAtom, LambdaId } from '../types';

// Higher-Order FlattenToDepthAtomFamily
export const FlattenGraphToDepthAtomFamily = (depth: number) => {
  const flattenToDepthAtomFamily = atomFamily((rootLambdaAtom: LambdaAtom) =>
    atom<Lambda>((get) => {
      const flattenGraphArray = (currentDepth: number) => (L: Lambda) => {
        const flat = flattenGraph(L, currentDepth + 1);

        const fakeFlat = {
          ...flat,
          connections: [],
          descriptions: [],
        };

        return [fakeFlat, ...flat.connections, ...flat.descriptions];
      };

      const flattenGraph = (graph: Lambda, currentDepth: number): Lambda => {
        const stillFlattening = currentDepth < depth;

        if (!stillFlattening) {
          return graph;
        }

        const connections = graph.connections.flatMap(flattenGraphArray(currentDepth));
        const descriptions = graph.descriptions.flatMap(flattenGraphArray(currentDepth));

        return {
          ...graph,
          connections,
          descriptions,
        };
      };

      // Apply the connectionsFirstProjection to the rootLambdaAtom before starting to flatten the graph.
      const rootGraph = get(LambdaPerspectiveGraphAtomFamily(rootLambdaAtom.id));

      if (!rootGraph) {
        throw new Error(`Root graph not found for [${rootLambdaAtom.id}]: ${rootLambdaAtom.value}`);
      }

      return flattenGraph(rootGraph, 0);
    })
  );

  return flattenToDepthAtomFamily;
};

// This is the number of levels deep to flatten the graph before just allowing the nodes are no longer flattened.
export const NoteViewFlattenDepthAtom = atom(0);
export const NoteViewFlattenInfinitelyAtom = atom(true);

export const LambdaNotesGraphAtomFamily = atomFamily((rootLambdaId: LambdaId) =>
  atom((get) => {
    const flattenInfinitely = get(NoteViewFlattenInfinitelyAtom);
    const NOTE_VIEW_DEPTH = flattenInfinitely ? Infinity : get(NoteViewFlattenDepthAtom);

    const rootLambdaAtom = get(fetchLambdaAtom(rootLambdaId));
    const descriptionsOnlyPerspective = descriptionsProjection(rootLambdaAtom);
    const flattenedLattice = get(FlattenGraphToDepthAtomFamily(NOTE_VIEW_DEPTH)(descriptionsOnlyPerspective));

    return flattenedLattice;
  })
);
