// LambdaActionCard.tsx
import { Box, Text, VStack } from '@chakra-ui/react';
import { LambdaAction } from './action-queue';

interface LambdaActionCardProps {
  action: LambdaAction;
}

const LambdaActionCard: React.FC<LambdaActionCardProps> = ({ action }) => {
  return (
    <Box border="1px" borderColor="gray.200" borderRadius="md" p={4}>
      <Text fontWeight="bold" mb={2}>
        {action.name}
      </Text>
      <VStack align="start" spacing={1}>
        <Text>{action.name}</Text>
      </VStack>
    </Box>
  );
};

export default LambdaActionCard;
