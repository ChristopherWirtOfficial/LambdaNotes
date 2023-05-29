import { LambdaAtom } from './types';

// NOTE: I think this is currently only used in some very specific example/demo cases that are probably a bit obsolete overall
//       I'm not sure if it's worth keeping around, but I'm leaving it for now just in case

// Clears a vector
export const clearVector =
  (key: 'descriptions' | 'connections') =>
  (lambdaAtom: LambdaAtom): LambdaAtom => ({
    ...lambdaAtom,
    [key]: [],
  });

// Appends one vector to another
export const appendVector =
  (fromKey: 'descriptions' | 'connections', toKey: 'descriptions' | 'connections') =>
  (lambdaAtom: LambdaAtom): LambdaAtom => ({
    ...lambdaAtom,
    [toKey]: [...lambdaAtom[toKey], ...lambdaAtom[fromKey]],
  });

// Swaps the two vectors
export const swapVectors = (lambdaAtom: LambdaAtom): LambdaAtom => ({
  ...lambdaAtom,
  descriptions: lambdaAtom.connections,
  connections: lambdaAtom.descriptions,
});

// Now, we can redefine your original projections using these fundamental operations:

export const descriptionsProjection = clearVector('connections');
export const connectionsProjection = clearVector('descriptions');
// Combines the two operations: append then clear
export const descriptionsFirstProjection = (lambdaAtom: LambdaAtom): LambdaAtom =>
  clearVector('connections')(appendVector('descriptions', 'connections')(lambdaAtom));

export const connectionsFirstProjection = (lambdaAtom: LambdaAtom): LambdaAtom =>
  clearVector('descriptions')(appendVector('connections', 'descriptions')(lambdaAtom));
