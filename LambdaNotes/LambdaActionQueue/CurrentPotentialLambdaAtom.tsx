// CurrentPotentialLambdaAction.tsx
import { Box, Text, VStack } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { potentialActionAtom, potentialActionLambdasAtom } from './action-queue';

const CurrentPotentialLambdaAction: React.FC = () => {
  const potentialAction = useAtomValue(potentialActionAtom);
  const primaryLambdas = useAtomValue(potentialActionLambdasAtom);

  if (!potentialAction) {
    return <Text>No potential action</Text>;
  }

  return (
    <Box border="1px" borderColor="gray.200" borderRadius="md" p={4} mb={4}>
      <Text fontWeight="bold" mb={2}>
        {potentialAction.name}
      </Text>
      <VStack align="start" spacing={1}>
        <Text color="gray.600">Primary Lambdas:</Text>
        {primaryLambdas?.map((L) => (
          <Text key={L.id} fontSize="sm" color="gray.600">
            {L.value}
          </Text>
        ))}
        <Text color="gray.600">Related Lambdas:</Text>
        {potentialAction.relatedLambdas?.map((lambdaId) => (
          <Text key={`related-${lambdaId}`} fontSize="sm" color="gray.600">
            {lambdaId}
          </Text>
        ))}
      </VStack>
    </Box>
  );
};

export default CurrentPotentialLambdaAction;
