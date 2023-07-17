import { ResetGameAtom, PlayerHasWonAtom, CurrentTurnAtom } from '../atoms';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { saveModel } from '../neural-network/model';

export const NumberOfLegalMovesAtom = atom(0);

// Number of Solves Atom
export const NumberOfSolvesAtom = atom(0);

// Total Turns Taken Atom
export const TotalTurnsTakenAtom = atom(0);

// Average Turns to Solve Atom
export const AverageTurnsToSolveAtom = atom((get) => {
  const totalTurns = get(TotalTurnsTakenAtom);
  const solves = get(NumberOfSolvesAtom);

  return solves ? totalTurns / solves : 0;
});

export const useWinGameAndReset = () => {
  const hasWon = useAtomValue(PlayerHasWonAtom);
  const currentTurn = useAtomValue(CurrentTurnAtom);
  const resetGame = useSetAtom(ResetGameAtom);
  const [numberOfSolves, setNumberOfSolves] = useAtom(NumberOfSolvesAtom);
  const [totalTurnsTaken, setTotalTurnsTaken] = useAtom(TotalTurnsTakenAtom);

  const averageTurnsToSolve = useAtomValue(AverageTurnsToSolveAtom);

  // Initialize game
  useEffect(() => {
    resetGame();
    console.log('Game initialized');
  }, [resetGame]);

  // Win the game and reset
  useEffect(() => {
    if (hasWon) {
      setNumberOfSolves((prevSolves) => prevSolves + 1);
      setTotalTurnsTaken((prevTotalTurns) => prevTotalTurns + currentTurn);
      resetGame();
      console.log('Game won!');

      // Also save the model
      saveModel();
    }
  }, [hasWon, currentTurn, resetGame, setNumberOfSolves, setTotalTurnsTaken]);

  return {
    hasWon,
    currentTurn,
    resetGame,
    numberOfSolves,
    totalTurnsTaken,
    averageTurnsToSolve,
  };
};
