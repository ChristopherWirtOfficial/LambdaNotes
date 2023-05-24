import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { LambdaUniverseAtomFamily } from './atoms';
import { LambdaId } from './types';

// Fetch a lambda atom by ID
export const fetchLambdaAtom = atomFamily((lambdaId: LambdaId) => {
  return atom((get) => get(LambdaUniverseAtomFamily(lambdaId)));
});
