import { ChessPiece } from './atoms';

export type MoveVector = { dx: number; dy: number; extent?: number };

export const PAWN_VECTORS: MoveVector[] = [
  { dx: 0, dy: 1, extent: 1 },
  { dx: 0, dy: -1, extent: 1 },
];

export const ROOK_VECTORS: MoveVector[] = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

export const KNIGHT_VECTORS: MoveVector[] = [
  { dx: 1, dy: 2, extent: 1 },
  { dx: 1, dy: -2, extent: 1 },
  { dx: -1, dy: 2, extent: 1 },
  { dx: -1, dy: -2, extent: 1 },
  { dx: 2, dy: 1, extent: 1 },
  { dx: 2, dy: -1, extent: 1 },
  { dx: -2, dy: 1, extent: 1 },
  { dx: -2, dy: -1, extent: 1 },
];

export const BISHOP_VECTORS: MoveVector[] = [
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 },
];

export const QUEEN_VECTORS: MoveVector[] = [...ROOK_VECTORS, ...BISHOP_VECTORS];

export const KING_VECTORS: MoveVector[] = QUEEN_VECTORS.map((vector) => ({ ...vector, extent: 1 }));

// Piece to Vectors map
export const MoveVectorsByPiece: Record<ChessPiece, MoveVector[]> = {
  Pawn: PAWN_VECTORS,
  Rook: ROOK_VECTORS,
  Knight: KNIGHT_VECTORS,
  Bishop: BISHOP_VECTORS,
  Queen: QUEEN_VECTORS,
  King: KING_VECTORS,
};
