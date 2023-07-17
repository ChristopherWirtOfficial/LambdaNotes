import { Box } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import {
  NumberOfSolvesAtom,
  TotalTurnsTakenAtom,
  AverageTurnsToSolveAtom,
  NumberOfLegalMovesAtom,
} from './hooks/useWinGameAndReset';
import { AttemptedMovesWithoutSuccessCount } from './neural-network/PlayStepAtom';
import { TotalMovesAttemptedAtom } from './neural-network/PlayStepAtom';

const StatsBoard: React.FC = () => {
  const numberOfSolves = useAtomValue(NumberOfSolvesAtom);
  const totalTurnsTaken = useAtomValue(TotalTurnsTakenAtom);
  const averageTurnsToSolve = useAtomValue(AverageTurnsToSolveAtom);
  const numberOfLegalMoves = useAtomValue(NumberOfLegalMovesAtom);
  const numberOfIllegalMoves = useAtomValue(AttemptedMovesWithoutSuccessCount);
  const totalMovesAttemptedAtom = useAtomValue(TotalMovesAttemptedAtom);

  // PercentValidMoves
  const PercentValidMoves = (numberOfLegalMoves / totalMovesAttemptedAtom) * 100;

  return (
    <Box p={4} backgroundColor="white" color="black" borderRadius="md">
      <p>Number of Solves: {numberOfSolves}</p>
      <p>Number of Legal Moves: {numberOfLegalMoves}</p>
      <p>Percent Valid Moves: {PercentValidMoves.toFixed(2)}%</p>
      <p>Total Moves Attempted: {totalMovesAttemptedAtom}</p>
      <p>Number of Illegal Moves (this game): {numberOfIllegalMoves}</p>
      <p>Total Turns Taken: {totalTurnsTaken}</p>
      <p>Average Turns to Solve: {averageTurnsToSolve.toFixed(2)}</p>
    </Box>
  );
};

export default StatsBoard;
