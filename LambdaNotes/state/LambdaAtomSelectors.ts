import { LambdaAtom } from './atoms';

// Clears a vector
export const clearVector =
  (key: 'description' | 'connections') =>
  (lambdaAtom: LambdaAtom): LambdaAtom => ({
    ...lambdaAtom,
    [key]: [],
  });

// Appends one vector to another
export const appendVector =
  (fromKey: 'description' | 'connections', toKey: 'description' | 'connections') =>
  (lambdaAtom: LambdaAtom): LambdaAtom => ({
    ...lambdaAtom,
    [toKey]: [...lambdaAtom[toKey], ...lambdaAtom[fromKey]],
  });

// Swaps the two vectors
export const swapVectors = (lambdaAtom: LambdaAtom): LambdaAtom => ({
  ...lambdaAtom,
  description: lambdaAtom.connections,
  connections: lambdaAtom.description,
});

// Now, we can redefine your original projections using these fundamental operations:

export const descriptionsProjection = clearVector('connections');
export const connectionsProjection = clearVector('description');
// Combines the two operations: append then clear
export const descriptionsFirstProjection = (lambdaAtom: LambdaAtom): LambdaAtom =>
  clearVector('connections')(appendVector('description', 'connections')(lambdaAtom));

export const connectionsFirstProjection = (lambdaAtom: LambdaAtom): LambdaAtom =>
  clearVector('description')(appendVector('connections', 'description')(lambdaAtom));
