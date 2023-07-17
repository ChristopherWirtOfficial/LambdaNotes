import { Flex, Heading, VStack } from '@chakra-ui/react';
import React from 'react';

import LambdaUniverse from './LambdaUniverse';
import { useCurrentlySelectedAsRoot, useGlobalLambdaClickHandling } from './state/useCurrentlySelectedLambda';
import useLambdaRootUniverse from './state/useLambdaRootUniverse';
import CurrentLambdaView from './CurrentLambdaView';
import { LambdaNotesGraphAtomFamily } from './state/Projections/LambdaNotesGraphAtomFamily';
import CurrentlySelectedDefinitions from './Dictionary/CurrentlySelectedDefinitions';
import { useSync } from './hooks/useSync';
import TypeScriptEditor from './TypescriptEditor';
import ActionQueue from './LambdaActionQueue/ActionQueue';

const LambdaNotes: React.FC = () => {
  useGlobalLambdaClickHandling();
  useSync();

  const rootLambdaUniverse = useLambdaRootUniverse();

  const notesRoot = useCurrentlySelectedAsRoot(LambdaNotesGraphAtomFamily);

  return (
    <VStack bg="blackAlpha.800" color="whiteAlpha.800">
      <ActionQueue />
      <Flex>
        <TypeScriptEditor key={notesRoot.id} />
        <CurrentLambdaView />
      </Flex>
      <Flex w="100vw" minH="100vh" p={10} justifyContent="space-between" gap={8}>
        <VStack flex="1" bg="gray.700" p={6} borderRadius="lg">
          <CurrentlySelectedDefinitions />
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
