import React, { FC } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Lambda } from './state/types';
import {
  CurrentlyFormingConnection,
  CurrentlySelectedLambda,
  useHandleLambdaClick,
} from './state/useCurrentlySelectedLambda';
import { ListItem, Box, List, VStack, Text } from '@chakra-ui/react';
import { LinkIcon } from '@chakra-ui/icons';
import { getDefinitionAtom } from './Dictionary/getDefinition';
import { splitSentenceLambdaAtom } from './state/actions/split-sentence-lambda';
import { checkBridgeAtom } from './state/actions/check-bridge';
import { deleteLambdaAtom } from './state';
import { LambdaAction, addActionAtom } from './LambdaActionQueue/action-queue';

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

type PotentialLambdaAction = Omit<LambdaAction, 'id'>;

const LambdaUniverse: FC<{ lambda: Lambda }> = ({ lambda }) => {
  const { value, id, connections, descriptions } = lambda;

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

  const getDefinition = useSetAtom(getDefinitionAtom);

  const getDef = async () => {
    console.log('Getting definition for', lambda.value);

    const definition = await getDefinition(lambda);

    console.log('definition', definition);
  };

  const splitSentence = useSetAtom(splitSentenceLambdaAtom);
  const checkBridge = useSetAtom(checkBridgeAtom);
  const deleteLambda = useSetAtom(deleteLambdaAtom);

  const actions: PotentialLambdaAction[] = [
    {
      name: 'Get definition',
      action: getDef,
      automatic: true,
    },
    {
      name: 'Split sentence',
      action: () => splitSentence(lambda.id),
      automatic: true,
    },
    {
      name: 'Check Bridge',
      action: () => checkBridge(lambda.id),
      automatic: true,
    },
    {
      name: 'Delete',
      action: () => deleteLambda(lambda.id),
    },
  ];

  const addActionToQueue = useSetAtom(addActionAtom);

  const addAction = (action: PotentialLambdaAction) => () => {
    addActionToQueue({
      ...action,
      primaryLambdas: [lambda.id],
    });
  };

  return (
    <Box w="100%" h="100%" borderWidth={isSelected ? '3px' : '1px'} borderColor={isSelected ? 'white' : 'darkgray'}>
      <Box p="1" onClick={handleLambdaClick} cursor="pointer">
        {value} <LinkIcon onClick={handleIconClick} color={formingConnection === id ? 'blue.500' : 'gray.500'} />
      </Box>
      {actions.map((potentialAction) => (
        <Box key={potentialAction.name} p={1} onClick={addAction(potentialAction)} color="whitesmoke" fontWeight="bold">
          <Text cursor="pointer">{potentialAction.name}</Text>
        </Box>
      ))}
      <VStack align="start" spacing={4}>
        <List>
          <ListItem>
            <LambdaList lambdas={descriptions} />
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
