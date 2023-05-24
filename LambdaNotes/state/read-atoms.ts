import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { LambdaId, LambdaUniverseAtomFamily } from './atoms';

// Fetch a lambda atom by ID
export const fetchLambdaAtom = atomFamily((lambdaId: LambdaId) => {
  return atom((get) => get(LambdaUniverseAtomFamily(lambdaId)));
});
