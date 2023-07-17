import { Getter, atom } from 'jotai';
import {
  MakeMoveAtom,
  GameActive,
  BOARD_SIZE,
  BoardStateAtom,
  BoardState,
  BoardCellState,
  ResetGameAtom,
  CurrentTurnAtom,
} from '../atoms';
import { OneHotBoardStateAtom } from './model-atoms';
import { MODEL_OUTPUT_SIZE, model, saveModel } from './model';
import * as tf from '@tensorflow/tfjs';
import { LegalMovesAtom } from '../MoveSequence';
import { NumberOfLegalMovesAtom } from '../hooks/useWinGameAndReset';

export const MAX_INVALID_MOVES_BEFORE_RESET = BOARD_SIZE * BOARD_SIZE;

function stochasticSample(probabilities: number[]): number {
  const sum = probabilities.reduce((a, b) => a + b, 0);
  let cumSum = 0;
  const rand = Math.random() * sum;
  for (let i = 0; i < probabilities.length; i++) {
    cumSum += probabilities[i];
    if (rand < cumSum) return i;
  }
  return probabilities.length - 1;
}

export const AttemptedMovesWithoutSuccessCount = atom(0);
export const TotalMovesAttemptedAtom = atom(0);

export const PlayStepAtom = atom(
  null, // default get value
  async (get, set) => {
    if (!get(GameActive)) {
      // If game is not active, no play step should be executed
      return;
    }

    // Increment the total moves attempted
    set(TotalMovesAttemptedAtom, (count) => count + 1);

    if (get(AttemptedMovesWithoutSuccessCount) > MAX_INVALID_MOVES_BEFORE_RESET) {
      // If the number of attempted moves without success is greater than the number of cells on the board,
      // then the game is stuck and should be reset

      // Reset the game
      console.log('Resetting game due to being stuck');
      set(ResetGameAtom);
      set(AttemptedMovesWithoutSuccessCount, 0);

      // Sure, save the model on reset
      saveModel();
    }
    // Fetch the current state from the OneHotBoardStateAtom
    const currentBoardState = get(OneHotBoardStateAtom).flat(2);

    // Call model.predict on the current state to get the model's policy for the next move
    const policyTensor = model.predict(tf.tensor([currentBoardState])) as tf.Tensor;
    // Output of the model is treated as unnormalized log probabilities
    const logProbabilities = await policyTensor.data();
    policyTensor.dispose();

    // Getting the legal moves from the legalMovesAtom
    const legalMoves = get(LegalMovesAtom);

    // Converting legal moves to indices that correspond to the units in the network output
    const legalMoveIndices = legalMoves.map(({ x, y }) => y * BOARD_SIZE + x);

    // Creating new array with the output of the network corresponding to a legal move
    const legalMoveLogProbabilities = legalMoveIndices.map((index) => logProbabilities[index]);

    // Converting unnormalized log probabilities to probabilities (using softmax)
    const legalMoveProbabilitiesTypedArray = await tf.softmax(tf.tensor(legalMoveLogProbabilities)).data();
    const legalMoveProbabilities = Array.from(legalMoveProbabilitiesTypedArray);

    // Selecting an action stochastically from legalMoveProbabilities
    const chosenIndex = stochasticSample(legalMoveProbabilities);

    // Converting chosen index back to 2D coordinates
    const chosenMove = {
      x: chosenIndex % BOARD_SIZE,
      y: Math.floor(chosenIndex / BOARD_SIZE),
    };

    const isLegalMove = legalMoves.some(({ x, y }) => x === chosenMove.x && y === chosenMove.y);

    if (!isLegalMove) {
      set(AttemptedMovesWithoutSuccessCount, (count) => count + 1);
    } else {
      set(NumberOfLegalMovesAtom, (count) => count + 1);
    }

    // Get current game state before making the move
    const oldGameState = get(BoardStateAtom);

    // Make the chosen move
    const ret = set(MakeMoveAtom, chosenMove);

    // After the move, get the new game state
    const newGameState = get(BoardStateAtom);

    const reward = ret ?? calculateReward(oldGameState, newGameState, get);

    // Generate target vector
    const targetVector = new Array(MODEL_OUTPUT_SIZE).fill(0);
    targetVector[chosenIndex] = reward;

    // Train the model based on the reward
    await model.fit(tf.tensor([currentBoardState]), tf.tensor([targetVector]), {
      epochs: 1,
    });

    // Save model
    if (newGameState.some((row) => row.includes('Player'))) {
      // await saveModel();
    }
  }
);

type Position = { x: number; y: number };

const findPosition = (state: BoardState, target: BoardCellState) =>
  state.flatMap((row, y) => row.map((cell, x) => ({ cell, position: { x, y } }))).find(({ cell }) => cell === target)
    ?.position as Position | undefined;

function calculateReward(oldGameState: BoardState, newGameState: BoardState, get: Getter): number {
  let reward = 0;

  const oldPlayerPosition = findPosition(oldGameState, 'Player');
  const oldTargetPosition = findPosition(oldGameState, 'Target');
  const newPlayerPosition = findPosition(newGameState, 'Player');
  const newTargetPosition = findPosition(newGameState, 'Target');

  if (!oldPlayerPosition || !oldTargetPosition || !newPlayerPosition || !newTargetPosition) {
    // This situation should not occur normally. If it does, it could mean that there's some other issue in the game state.
    return -100;
  }

  // No movement at all, the model should be encouraged to at least make some moves.
  if (oldPlayerPosition.x === newPlayerPosition.x && oldPlayerPosition.y === newPlayerPosition.y) {
    reward -= 10;
  }

  // Winning gives a high reward
  if (newPlayerPosition.x === newTargetPosition.x && newPlayerPosition.y === newTargetPosition.y) {
    reward += 100;
  }

  // Calculate Euclidean distances
  const distance = (p1: Position, p2: Position) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

  const oldDistance = distance(oldPlayerPosition, oldTargetPosition);
  const newDistance = distance(newPlayerPosition, newTargetPosition);

  // The reward is proportional to the improvement in distance.
  const distanceImprovement = oldDistance - newDistance;

  if (distanceImprovement > 0) {
    // Moving closer to the target
    reward += 5 + 10 * distanceImprovement;
  } else {
    // Moving away from the target
    reward += 5; // Better than making bad moves!
  }

  // Penalize for too many turns
  const turnsTaken = get(CurrentTurnAtom); // you'll need to define this atom, which tracks the number of turns taken
  reward -= turnsTaken;

  return reward;
}
