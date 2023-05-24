import { Flex, Heading, VStack } from '@chakra-ui/react';
import React from 'react';

import LambdaUniverse from './LambdaUniverse';
import { useCurrentlySelectedAsRoot, useGlobalLambdaClickHandling } from './state/useCurrentlySelectedLambda';
import useLambdaRootUniverse from './state/useLambdaRootUniverse';
import CurrentLambdaView from './CurrentLambdaView';
import TypeScriptEditor from './TypescriptEditor';
import { NoteViewAtomFamily } from './state/Projections/NoteViewAtomFamily';

const LambdaNotes: React.FC = () => {
  useGlobalLambdaClickHandling();

  const rootLambdaUniverse = useLambdaRootUniverse();

  const notesRoot = useCurrentlySelectedAsRoot(NoteViewAtomFamily);

  return (
    <VStack bg="blackAlpha.800" color="whiteAlpha.800">
      <Flex>
        <TypeScriptEditor key={notesRoot.id} />
        <CurrentLambdaView />
      </Flex>
      <Flex w="100vw" minH="100vh" p={10} justifyContent="space-between" gap={8}>
        <VStack flex="1" bg="gray.700" p={6} borderRadius="lg">
          <Heading as="h2" size="lg" color="white">
            Actual Root
          </Heading>
          {rootLambdaUniverse ? <LambdaUniverse lambda={rootLambdaUniverse} /> : null}
        </VStack>
      </Flex>
    </VStack>
  );
};

export default LambdaNotes;
