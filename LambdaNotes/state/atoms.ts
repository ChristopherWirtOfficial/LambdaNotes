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

export * from './read-atoms';
export * from './LambdaAtomSelectors';
export * from './write-atoms';

export * from './Projections';
