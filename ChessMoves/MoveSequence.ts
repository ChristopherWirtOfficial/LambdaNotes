import { atom } from 'jotai';
import { create as createRng } from 'random-seed';
import { BOARD_SIZE, ChessPiece, CurrentPieceAtom, PlayerPositionAtom, SeedAtom } from './atoms';
import { MoveVectorsByPiece } from './MoveVectors';

export const MOVES_LENGTH = 100;

// const pieces: Array<ChessPiece> = ['Pawn', 'Knight', 'Bishop', 'Rook', 'Queen', 'King'];

const pieces: ChessPiece[] = ['Queen'];

// The sequence of chess pieces
export const MoveSequenceAtom = atom((get) => {
  const seed = get(SeedAtom);
  const rng = createRng(seed);

  return Array(MOVES_LENGTH)
    .fill(null)
    .map(() => pieces[rng.range(pieces.length)]);
});

export function* makeMoves(px: number, py: number, dx: number, dy: number, extent?: number) {
  let newX = px;
  let newY = py;
  let steps = 0;

  while (true) {
    newX += dx;
    newY += dy;
    steps++;

    if (newX < 0 || newX >= BOARD_SIZE || newY < 0 || newY >= BOARD_SIZE || (extent && steps > extent)) {
      return;
    }

    yield { x: newX, y: newY };
  }
}

export const LegalMovesAtom = atom((get) => {
  const piece = get(CurrentPieceAtom);
  const { x: px, y: py } = get(PlayerPositionAtom);
  const moveVectors = MoveVectorsByPiece[piece];

  return moveVectors.flatMap(({ dx, dy, extent }) => [...makeMoves(px, py, dx, dy, extent)]);
});
