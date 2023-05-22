import { Box, Button, VStack } from '@chakra-ui/react';
import React, { FC } from 'react';

import LambdaUniverse from './LambdaUniverse';
import { useGlobalCurrentlySelectedLambdaHandling } from './state/useCurrentlySelectedLambda';
import useLambdaRootUniverse, { THE_ROOT_UNIVERSE } from './state/useLambdaRootUniverse';
import { LambdaUniverseAtomFamily } from './state/atoms';
import { useAtom } from 'jotai';

const RootDebug: FC = () => {
  const [rootLambdaAtom, setRootLambdaAtom] = useAtom(LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE));

  console.log('FUCKYOU', rootLambdaAtom);

  return (
    <VStack>
      <Box>The rooooooooot</Box>
      <Box>
        {rootLambdaAtom.id} - {rootLambdaAtom.value}
      </Box>
      {rootLambdaAtom.connections.map((connection) => (
        <Box>{connection}</Box>
      ))}
      {rootLambdaAtom.description.map((description) => (
        <Box>{description}</Box>
      ))}
    </VStack>
  );
};

const LambdaNotes: FC = () => {
  useGlobalCurrentlySelectedLambdaHandling();

  const rootLambdaUniverse = useLambdaRootUniverse();

  return (
    <Box w="100vw" minH="100vh" bg="blackAlpha.800" color="whiteAlpha.800" p={10}>
      <RootDebug />
      {rootLambdaUniverse ? <LambdaUniverse lambda={rootLambdaUniverse} /> : null}
    </Box>
  );
};

export default LambdaNotes;
