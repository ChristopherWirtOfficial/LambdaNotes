import React, { FC, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Lambda, LambdaAtom } from './state/atoms';
import { createAndInitializeLambdaAtom, addToConnectionsAtom, addToDescriptionAtom } from './state/write-atoms';
import {
  CurrentlyFormingConnection,
  CurrentlySelectedLambda,
  useHandleLambdaClick,
} from './state/useCurrentlySelectedLambda';
import { ListItem, Box, Input, List, VStack } from '@chakra-ui/react';
import { LinkIcon } from '@chakra-ui/icons';

type LambdaListProps = {
  lambdas: Lambda[];
  isSelected: boolean;
  handleAddLambda: (lambda: Omit<LambdaAtom, 'id'>) => void;
};

const LambdaList: FC<LambdaListProps> = ({ lambdas, handleAddLambda, isSelected }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue.trim()) {
      const newLambda: Omit<LambdaAtom, 'id'> = {
        value: inputValue,
        connections: [],
        description: [],
      };

      handleAddLambda(newLambda);
      setInputValue('');
    }
  };

  return (
    <VStack align="start" spacing={4} pl="4" py="1">
      {lambdas.map((L) => (
        <LambdaUniverse key={L.id} lambda={L} />
      ))}
      {isSelected && (
        <form onSubmit={handleFormSubmit}>
          <Input value={inputValue} onChange={handleInputChange} placeholder="Add new..." />
        </form>
      )}
    </VStack>
  );
};

const LambdaUniverse: FC<{ lambda: Lambda }> = ({ lambda }) => {
  const { value, id, connections, description } = lambda;

  const [selectedLambda] = useAtom(CurrentlySelectedLambda);

  const createLambda = useSetAtom(createAndInitializeLambdaAtom);
  const addToConnections = useSetAtom(addToConnectionsAtom);
  const addToDescription = useSetAtom(addToDescriptionAtom);

  const isSelected = lambda.id === selectedLambda;

  const handleAddConnectionLambda = (newLambda: Omit<LambdaAtom, 'id'>) => {
    const newLambdaId = createLambda({ ...newLambda, connections: [id] });
    addToConnections({ lambdaId: id, connectionId: newLambdaId });
  };

  const handleAddDescriptionLambda = (newLambda: Omit<LambdaAtom, 'id'>) => {
    const newLambdaId = createLambda({ ...newLambda, connections: [id] });
    addToDescription({ lambdaId: id, descriptionId: newLambdaId });
  };

  const handleLambdaClick = useHandleLambdaClick(id);

  const [formingConnection, setFormingConnection] = useAtom(CurrentlyFormingConnection);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the lambda selection when the icon is clicked
    if (formingConnection === id) {
      setFormingConnection(null); // If this lambda is currently in connection mode, cancel it
    } else {
      setFormingConnection(id); // Else, set this lambda as the one forming a connection
    }
  };

  return (
    <Box w="100%" h="100%" borderWidth={isSelected ? '3px' : '1px'} borderColor={isSelected ? 'white' : 'darkgray'}>
      <Box p="1" onClick={handleLambdaClick}>
        {value} <LinkIcon onClick={handleIconClick} color={formingConnection === id ? 'blue.500' : 'gray.500'} />
      </Box>
      <VStack align="start" spacing={4}>
        <List>
          <ListItem>
            <LambdaList lambdas={description} handleAddLambda={handleAddDescriptionLambda} isSelected={isSelected} />
          </ListItem>
          <ListItem>
            <LambdaList lambdas={connections} handleAddLambda={handleAddConnectionLambda} isSelected={isSelected} />
          </ListItem>
        </List>
      </VStack>
    </Box>
  );
};

export default LambdaUniverse;
