import {
  VStack,
  Box,
  Grid,
  Button,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { BoardStateAtom, BOARD_SIZE } from './atoms';
import { useAtom } from 'jotai';
import PieceQueue from './PieceQueue';
import BoardCell from './BoardCell';
import { useWinGameAndReset } from './hooks/useWinGameAndReset';
import StatsBoard from './StatsBoard';
import { useAutoPlay, IntervalLengthAtom } from './hooks/useAutoPlay';
import { useWeightsVisualization } from './hooks/useWeightsVisualization';

// Generate board shape
const boardShape = [...Array(BOARD_SIZE)].map((_, y) => [...Array(BOARD_SIZE)].map((_, x) => ({ x, y })));

const ChessMoves: React.FC = () => {
  const [boardState] = useAtom(BoardStateAtom);
  const { isActive, setActive } = useAutoPlay();
  const { resetGame } = useWinGameAndReset();
  const [intervalLength, setIntervalLength] = useAtom(IntervalLengthAtom);

  const handleIntervalChange = (valueAsString: string, valueAsNumber: number) => {
    if (!isNaN(valueAsNumber) && valueAsNumber > 0) {
      setIntervalLength(valueAsNumber);
    }
  };

  useWeightsVisualization();

  return (
    <VStack bg="slategray" color="whitesmoke" minHeight="100vh" width="100%" p={6}>
      <Box>Chess Moves</Box>
      <PieceQueue />
      <StatsBoard />

      <Checkbox isChecked={isActive} onChange={(e) => setActive(e.target.checked)}>
        Auto Play
      </Checkbox>

      <NumberInput min={0} max={5000} value={intervalLength} onChange={handleIntervalChange}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <Grid templateColumns={`repeat(${BOARD_SIZE}, 1fr)`} gap="2px">
        {boardShape.flatMap((row, y) =>
          row.map(({ x }) => {
            const cellState = boardState[y][x];

            return <BoardCell key={`${x}-${y}-piece`} x={x} y={y} cellState={cellState} />;
          })
        )}
      </Grid>
      <Button colorScheme="red" onClick={() => resetGame()}>
        Reset Game
      </Button>
    </VStack>
  );
};

export default ChessMoves;
