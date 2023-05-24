import React, { FC } from 'react';
import { useAtom } from 'jotai';
import { Lambda } from './state/atoms';
import {
  CurrentlyFormingConnection,
  CurrentlySelectedLambda,
  useHandleLambdaClick,
} from './state/useCurrentlySelectedLambda';
import { ListItem, Box, List, VStack } from '@chakra-ui/react';
import { LinkIcon } from '@chakra-ui/icons';

type LambdaListProps = {
  lambdas: Lambda[];
};

const LambdaList: FC<LambdaListProps> = ({ lambdas }) => {
  return (
    <VStack align="start" spacing={4} p={4} w="100%">
      {lambdas.map((L) => (
        <LambdaUniverse key={L.id} lambda={L} />
      ))}
    </VStack>
  );
};

const LambdaUniverse: FC<{ lambda: Lambda }> = ({ lambda }) => {
  const { value, id, connections, description } = lambda;

  const [selectedLambda] = useAtom(CurrentlySelectedLambda);

  const isSelected = lambda.id === selectedLambda;

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
            <LambdaList lambdas={description} />
          </ListItem>
          <ListItem>
            <LambdaList lambdas={connections} />
          </ListItem>
        </List>
      </VStack>
    </Box>
  );
};

export default LambdaUniverse;
