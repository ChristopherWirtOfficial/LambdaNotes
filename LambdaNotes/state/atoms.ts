import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { LambdaAtom, LambdaId } from './types';
import { VirtualLambdaAtom } from '.';

// An atom family that stores every single lambda in the universe
export const LambdaUniverseAtomFamily = atomFamily((id: LambdaId) =>
  atom<VirtualLambdaAtom | LambdaAtom>({
    id,
    value: '***NEVER SEEN***',
    descriptions: [],
    connections: [],
  })
);

export const LambdaUniverseList = new Set<LambdaId>();

export const doesLambdaIdExist = (id: LambdaId): boolean => {
  const exists = LambdaUniverseList.has(id);

  // If the LambdaId already exists, great. If not, add it to the list, but return false
  return exists || !LambdaUniverseList.add(id);
};

// Fetch a lambda atom by ID
export const fetchLambdaAtom = atomFamily((lambdaId: LambdaId) => {
  return atom((get) => get(LambdaUniverseAtomFamily(lambdaId)));
});

export * from './LambdaAtomSelectors';
export * from './write-atoms';

export * from './Projections';
