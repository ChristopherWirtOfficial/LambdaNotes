import { Flex, Heading, VStack } from '@chakra-ui/react';
import React, { FC } from 'react';

import LambdaUniverse from './LambdaUniverse';
import { useGlobalLambdaClickHandling } from './state/useCurrentlySelectedLambda';
import useLambdaRootUniverse from './state/useLambdaRootUniverse';
import CurrentLambdaView from './CurrentLambdaView';
import TypeScriptEditor from './TypescriptEditor';

const LambdaNotes: FC = () => {
  useGlobalLambdaClickHandling();

  const rootLambdaUniverse = useLambdaRootUniverse();

  return (
    <VStack>
      <TypeScriptEditor />
      <Flex
        w="100vw"
        minH="100vh"
        bg="blackAlpha.800"
        color="whiteAlpha.800"
        p={10}
        justifyContent="space-between"
        gap={8}
      >
        <VStack flex="1" bg="gray.700" p={6} borderRadius="lg">
          <Heading as="h2" size="lg" color="white">
            Actual Root
          </Heading>
          {rootLambdaUniverse ? <LambdaUniverse lambda={rootLambdaUniverse} /> : null}
        </VStack>
        <CurrentLambdaView />
      </Flex>
    </VStack>
  );
};

export default LambdaNotes;
