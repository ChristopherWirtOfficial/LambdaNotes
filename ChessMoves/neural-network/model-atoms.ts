import { atom } from 'jotai';
import { BOARD_SIZE, BoardStateAtom } from '../atoms';

export const BOARD_STATE_SIZE = 4; // One hot encoding of the board state

export const MODEL_INPUT_SIZE = BOARD_SIZE * BOARD_SIZE * BOARD_STATE_SIZE;

export const OneHotBoardStateAtom = atom((get) => {
  const boardState = get(BoardStateAtom);

  return boardState.map((row) =>
    row.map((cell) => {
      switch (cell) {
        case 'Player':
          return [1, 0, 0, 0];
        case 'Target':
          return [0, 1, 0, 0];
        case 'LegalMove':
          return [0, 0, 1, 0];
        case 'TargetAndLegalMove':
          return [0, 1, 1, 0]; // Not just its own thing, but also a legal move
        default:
          return [0, 0, 0, 1];
      }
    })
  );
});
