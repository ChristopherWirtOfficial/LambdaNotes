import { atom } from 'jotai';
import { create as createRng } from 'random-seed';
import { LegalMovesAtom, MoveSequenceAtom } from './MoveSequence';

export const BOARD_SIZE = 8;

export type ChessPiece = 'Pawn' | 'Rook' | 'Knight' | 'Bishop' | 'Queen' | 'King';

export const GameActive = atom(false);

// Player Position Atom
export const PlayerPositionAtom = atom({ x: 0, y: 0 });

// Target Position Atom
export const TargetPositionAtom = atom({ x: 0, y: 0 });

// Seed Atom
export const SeedAtom = atom('');

// The index in the MoveSequenceAtom
export const CurrentTurnAtom = atom(0);

export const CurrentPieceAtom = atom<ChessPiece>((get) => {
  const index = get(CurrentTurnAtom);
  const sequence = get(MoveSequenceAtom);

  return sequence[index];
});

export const MakeMoveAtom = atom(null, (get, set, { x, y }: { x: number; y: number }) => {
  const { x: px, y: py } = get(PlayerPositionAtom);

  if (x === px && y === py) {
    // throw new Error('Cannot move to the same position');
    return -5;
  }

  const legalMoves = get(LegalMovesAtom);

  if (!legalMoves.some((move) => move.x === x && move.y === y)) {
    // console.log('Cannot move to that position', x, y);
    // throw new Error('Cannot move to that position');
    return -3;
  }

  set(PlayerPositionAtom, { x, y });
  set(CurrentTurnAtom, (index) => index + 1);
});

export const ResetGameAtom = atom(
  null, // default get value
  (get, set, seed?: string) => {
    set(GameActive, false);
    // write function, with optional new seed
    const newSeed = seed || Math.random().toString(36).substring(2);
    set(SeedAtom, newSeed); // set new seed

    const rng = createRng(newSeed);

    const generatePosition = () => ({
      x: rng.intBetween(0, BOARD_SIZE - 1),
      y: rng.intBetween(0, BOARD_SIZE - 1),
    });

    const playerPosition = generatePosition();

    const generateUntilNotPlayerPosition = () => {
      let target = generatePosition();

      while (target.x === playerPosition.x && target.y === playerPosition.y) {
        target = generatePosition();
      }

      return target;
    };

    const targetPosition = generateUntilNotPlayerPosition();

    set(PlayerPositionAtom, playerPosition);
    set(TargetPositionAtom, targetPosition);

    set(CurrentTurnAtom, 0);
    set(GameActive, true);
  }
);

export type BoardCellState = 'Empty' | 'Player' | 'Target' | 'LegalMove' | 'TargetAndLegalMove';

export type BoardState = BoardCellState[][];

export const BoardStateAtom = atom((get) => {
  const { x: px, y: py } = get(PlayerPositionAtom);
  const { x: tx, y: ty } = get(TargetPositionAtom);
  const legalMoves = get(LegalMovesAtom);

  return [...Array(BOARD_SIZE)].map((_, y) =>
    [...Array(BOARD_SIZE)].map((_, x) => {
      const isLegalMove = legalMoves.some((move) => move.x === x && move.y === y);

      if (x === px && y === py) return 'Player';
      if (x === tx && y === ty) return isLegalMove ? 'TargetAndLegalMove' : 'Target';
      if (isLegalMove) return 'LegalMove';

      return 'Empty';
    })
  );
});

export const PlayerHasWonAtom = atom((get) => {
  const { x: px, y: py } = get(PlayerPositionAtom);
  const { x: tx, y: ty } = get(TargetPositionAtom);

  const gameActive = get(GameActive);

  return gameActive && px === tx && py === ty;
});
