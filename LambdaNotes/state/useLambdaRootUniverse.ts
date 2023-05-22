import { useAtom } from 'jotai';
import { LambdaPerspectiveGraphAtomFamily, LambdaUniverseAtomFamily } from './atoms';
import { useEffect } from 'react';
import useInitialSetup from '../hooks/useInitialSetup';
import { createAndInitializeLambdaAtom } from './write-atoms';

export const THE_ROOT_UNIVERSE = '***THE_ROOT_UNIVERSE***';

const useInitializeRootUniverse = () => {
  const [, initializeRoot] = useAtom(createAndInitializeLambdaAtom);

  useEffect(() => {
    initializeRoot({
      id: THE_ROOT_UNIVERSE,
      value: 'Root Universe',
      description: [],
      connections: [],
    });
  }, []);
};

// The Hooks
export const useLambdaRootUniverse = () => {
  useInitializeRootUniverse();
  // Establish/retrieve the root lambda - this will be the first lambda in the universe, and will be the root of the tree
  const [rootUniverseAtom] = useAtom(LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE));

  // Get the projected lambdas for the root universe
  const [rootUniverseLambdasAtom] = useAtom(LambdaPerspectiveGraphAtomFamily(rootUniverseAtom));

  // Adds some flavor to the fake root universe
  useInitialSetup();

  return rootUniverseLambdasAtom;
};

export default useLambdaRootUniverse;
