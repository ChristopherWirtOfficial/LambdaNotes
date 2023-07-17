import { Button } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { BoardCellState, MakeMoveAtom } from './atoms';
import { LegalMovesAtom } from './MoveSequence';

interface BoardCellProps {
  x: number;
  y: number;
  cellState: BoardCellState;
}

const BoardCell: React.FC<BoardCellProps> = ({ x, y, cellState }) => {
  const [, makeMove] = useAtom(MakeMoveAtom);
  const legalMoves = useAtomValue(LegalMovesAtom);

  const isLegalMove = legalMoves.some((move) => move.x === x && move.y === y);

  const colorScheme = {
    Player: 'blue',
    Target: 'green',
    LegalMove: 'orange',
    TargetAndLegalMove: 'purple',
    Empty: (x + y) % 2 === 0 ? 'gray' : 'blackAlpha',
  }[cellState];

  return (
    <Button
      size="lg"
      rounded="sm"
      colorScheme={colorScheme}
      key={`cell-${x}-${y}`}
      onClick={() => isLegalMove && makeMove({ x, y })}
      aspectRatio={1}
    >
      {cellState === 'Player' ? 'P' : cellState.startsWith('Target') ? 'T' : ''}
    </Button>
  );
};

export default BoardCell;
