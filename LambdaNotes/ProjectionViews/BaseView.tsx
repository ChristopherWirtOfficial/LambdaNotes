// BaseView.tsx
import React from 'react';
import { VStack, Heading, HStack, Box, Input } from '@chakra-ui/react';
import { useAddLambda } from '../state/useAddLambda';
import LambdaUniverse from '../LambdaUniverse';
import { Lambda } from '../state';

interface BaseViewProps {
  lambda: Lambda;
  addToConnections: (newLambdaId: string) => void;
  addToDescription: (newLambdaId: string) => void;
}

export const BaseView: React.FC<BaseViewProps> = ({ lambda, addToConnections, addToDescription }) => {
  const connection = useAddLambda({
    addToCategory: (newLambdaId: string) => {
      addToConnections(newLambdaId);
    },
  });

  const description = useAddLambda({
    addToCategory: (newLambdaId: string) => {
      addToDescription(newLambdaId);
    },
  });

  return (
    <VStack flex="1" bg="gray.700" p={6} borderRadius="lg" marginLeft={8}>
      <Heading as="h2" size="lg" color="white">
        Currently Selected
      </Heading>
      <HStack spacing={6}>
        <VStack>
          <Box>Add Connection</Box>
          <form onSubmit={connection.handleFormSubmit}>
            <Input value={connection.inputValue} onChange={connection.handleInputChange} placeholder="Add new..." />
          </form>
        </VStack>
        <VStack>
          <Box>Add Description</Box>
          <form onSubmit={description.handleFormSubmit}>
            <Input value={description.inputValue} onChange={description.handleInputChange} placeholder="Add new..." />
          </form>
        </VStack>
      </HStack>
      <LambdaUniverse lambda={lambda} />
    </VStack>
  );
};

export default BaseView;
