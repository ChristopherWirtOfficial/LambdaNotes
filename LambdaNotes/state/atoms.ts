import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { LambdaAtom, LambdaId } from './types';
import { VirtualLambdaAtom } from '.';

export const DefaultLambda = (id: LambdaId) =>
  ({
    id,
    value: '***NEVER SEEN***',
    descriptions: [],
    connections: [],
  } as LambdaAtom);

export const DeletedLambdaIds = new Set<LambdaId>();

// An atom family that stores every single lambda in the universe
export const LambdaUniverseAtomFamily = atomFamily((id: LambdaId) =>
  atom<VirtualLambdaAtom | LambdaAtom>(DefaultLambda(id))
);

export const LambdaUniverseList = new Set<LambdaId>();

export const doesLambdaIdExist = (id: LambdaId): boolean => {
  const exists = LambdaUniverseList.has(id);

  // If the LambdaId already exists, great. If not, add it to the list, but return false
  return exists || !LambdaUniverseList.add(id);
};

// Fetch a lambda atom by ID
export const fetchLambdaAtom = atomFamily((lambdaId: LambdaId) => {
  if (DeletedLambdaIds.has(lambdaId)) {
    throw new Error(`Lambda with id ${lambdaId} has been deleted`);
  }

  return atom((get) => get(LambdaUniverseAtomFamily(lambdaId)));
});

export * from './LambdaAtomSelectors';
export * from './write-atoms';

export * from './Projections';
