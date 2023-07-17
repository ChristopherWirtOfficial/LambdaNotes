import { Box, Text, HStack, Flex } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { CurrentTurnAtom } from './atoms';
import { MoveSequenceAtom } from './MoveSequence';

const PieceQueue: React.FC = () => {
  const currentTurn = useAtomValue(CurrentTurnAtom);
  const sequence = useAtomValue(MoveSequenceAtom);

  const seed = useAtomValue(MoveSequenceAtom);

  const nextPieces = sequence.slice(currentTurn, currentTurn + 5);

  return (
    <Flex flexDir="column" p={3} gap={2}>
      <Box>
        <Text>Current Move: {currentTurn}</Text>
      </Box>
      <HStack spacing={2} align="stretch">
        {nextPieces.map((piece, i) => (
          <Box
            key={`${seed}-piece-${currentTurn - i}`}
            p={3}
            color={i === 0 ? 'white' : 'gray.500'}
            borderBottomWidth={1}
            borderColor="gray.200"
            bg={i === 0 ? 'purple.500' : 'gray.100'}
          >
            <Text userSelect="none">{piece}</Text>
          </Box>
        ))}
      </HStack>
    </Flex>
  );
};

export default PieceQueue;
