import { v4 as uuidv4 } from 'uuid';

export const now = () => performance.now();

// When going in 10 steps from 0 to 100... you don't increment by 10
export const calcPercentProgress = (frame: number, steps: number) => {
  const extraBit = 1 / (1 - 1 / steps);
  const regularPercent = ((frame % steps) / steps) * 100;

  const actualPercent = extraBit * regularPercent;

  return actualPercent;
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const xDiff = x1 - x2;
  const yDiff = y1 - y2;
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

export const uuid = (type?: string) => `${type ?? ''}${uuidv4()}`;

// eslint-disable-next-line max-len
export const randomColor = (highestVal = 220) => `rgb(
  ${Math.floor(Math.random() * highestVal)},
  ${Math.floor(Math.random() * highestVal)},
  ${Math.floor(Math.random() * highestVal)}
)`;
