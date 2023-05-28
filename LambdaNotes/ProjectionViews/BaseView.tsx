// BaseView.tsx
import React from 'react';
import { VStack, HStack, Box, Input } from '@chakra-ui/react';
import { useAddLambda } from '../state/useAddLambda';
import LambdaUniverse from '../LambdaUniverse';
import { Lambda } from '../state';

interface BaseViewProps {
  lambda: Lambda;
}

export const BaseView: React.FC<BaseViewProps> = ({ lambda }) => {
  const connectionContext = useAddLambda({
    parentLambdaId: lambda.id,
    relationship: 'connection',
  });

  const descriptionContext = useAddLambda({
    parentLambdaId: lambda.id,
    relationship: 'description',
  });

  return (
    <VStack flex="1" bg="gray.700" p={6} borderRadius="lg" marginLeft={8}>
      <HStack spacing={6}>
        <VStack>
          <Box>Add Connection</Box>
          <form onSubmit={connectionContext.handleFormSubmit}>
            <Input
              value={connectionContext.inputValue}
              onChange={connectionContext.handleInputChange}
              placeholder="Add new..."
            />
          </form>
        </VStack>
        <VStack>
          <Box>Add Description</Box>
          <form onSubmit={descriptionContext.handleFormSubmit}>
            <Input
              value={descriptionContext.inputValue}
              onChange={descriptionContext.handleInputChange}
              placeholder="Add new..."
            />
          </form>
        </VStack>
      </HStack>
      <LambdaUniverse lambda={lambda} />
    </VStack>
  );
};

export default BaseView;
