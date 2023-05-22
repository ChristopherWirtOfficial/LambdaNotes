import { Box } from '@chakra-ui/react';
import React, { FC } from 'react';

import LambdaUniverse from './LambdaUniverse';
import { useGlobalCurrentlySelectedLambdaHandling } from './state/useCurrentlySelectedLambda';
import useLambdaRootUniverse from './state/useLambdaRootUniverse';

const LambdaNotes: FC = () => {
  useGlobalCurrentlySelectedLambdaHandling();

  const rootLambdaUniverse = useLambdaRootUniverse();

  return (
    <Box w="100vw" minH="100vh" bg="blackAlpha.800" color="whiteAlpha.800" p={10}>
      {rootLambdaUniverse ? <LambdaUniverse lambda={rootLambdaUniverse} /> : null}
    </Box>
  );
};

export default LambdaNotes;
