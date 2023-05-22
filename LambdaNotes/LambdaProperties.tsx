import React, { FC, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Lambda, LambdaAtom, LambdaUniverseAtomFamily } from './state/atoms';

import { createAndInitializeLambdaAtom, addToConnectionsAtom, addToDescriptionAtom } from './state/write-atoms';
import { CurrentlySelectedLambda } from './state/useCurrentlySelectedLambda';
import {
  FormLabel,
  HStack,
  ListItem,
  Box,
  Button,
  Input,
  List,
  VStack,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
} from '@chakra-ui/react';

type LambdaPropertiesProps = {
  name: string;
  lambdas: Lambda[];
  handleAddLambda: (lambda: Omit<LambdaAtom, 'id'>) => void;
};

const LambdaProperties: FC<LambdaPropertiesProps> = ({ name, lambdas, handleAddLambda }) => {
  const [, createLambda] = useAtom(createAndInitializeLambdaAtom);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue.trim()) {
      // Form a new lambda without an id including the connection to the parent lambda's id
      const newLambda: Omit<LambdaAtom, 'id'> = {
        value: inputValue,
        connections: [], // No connections initially
        description: [], // No description initially
      };

      handleAddLambda(newLambda);

      setInputValue(''); // Clear the input field
    }
  };

  return (
    <Box>
      <FormLabel fontSize="xl" mb={2}>
        {name}:
      </FormLabel>
      <form onSubmit={handleFormSubmit}>
        <HStack>
          <Input value={inputValue} onChange={handleInputChange} placeholder={`Add a new ${name}...`} />
          <Button type="submit">Add</Button>
        </HStack>
      </form>
      <List px="10">
        {lambdas.map((L) => (
          <ListItem key={`${name}-${L.id}`}>
            <LambdaUniverse lambda={L} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
