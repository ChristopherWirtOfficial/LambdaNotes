// ActionQueue.tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { Box, Button, HStack, VStack } from '@chakra-ui/react';
import {
  actionQueueAtom,
  deleteActionAtom,
  executeActionAtom,
  popActionAtom,
  potentialActionAtom,
} from './action-queue';
import LambdaActionCard from './LambdaActionCard';
import CurrentPotentialLambdaAction from './CurrentPotentialLambdaAtom';
import { useEffect } from 'react';

const ActionQueue: React.FC = () => {
  const popAction = useSetAtom(popActionAtom);
  const executeAction = useSetAtom(executeActionAtom);
  const deleteAction = useSetAtom(deleteActionAtom);
  const potentialAction = useAtomValue(potentialActionAtom);

  const upcomingActions = useAtomValue(actionQueueAtom);

  // If there's something to pop, always pop the next action
  useEffect(() => {
    if (!potentialAction && upcomingActions.length > 0) {
      popAction();
    }
  }, [potentialAction, upcomingActions, popAction]);

  useEffect(() => {
    if (potentialAction?.automatic) {
      executeAction();
    }
  }, [potentialAction, executeAction]);

  return (
    <VStack spacing={4}>
      <CurrentPotentialLambdaAction />
      <Button onClick={popAction} colorScheme="blue">
        Show next action
      </Button>
      {potentialAction && (
        <Box>
          <Button onClick={executeAction} colorScheme="green">
            Execute {potentialAction.name}
          </Button>
          <Button onClick={deleteAction} colorScheme="red">
            Delete {potentialAction.name}
          </Button>
        </Box>
      )}
      <HStack gap={3}>
        {upcomingActions.map((action) => (
          <LambdaActionCard key={action.id} action={action} />
        ))}
      </HStack>
    </VStack>
  );
};

export default ActionQueue;
