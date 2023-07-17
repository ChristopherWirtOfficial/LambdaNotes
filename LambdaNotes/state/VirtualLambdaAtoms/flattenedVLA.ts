import { atom } from 'jotai';
import {
  Lambda,
  LambdaId,
  ProjectionFunction,
  VirtualLambdaAtom,
  createAndInitializeLambdaAtom,
  createLambdaFromAtom,
  fetchLambdaAtom,
} from '..';

export const flattenTraversal: ProjectionFunction = (context) => {
  const lambdaAtom = context.get(fetchLambdaAtom(context.lambdaId));
  const lambda = createLambdaFromAtom(lambdaAtom, context.depth, context);

  // Flatten descriptions: DFS on descriptions only
  lambda.descriptions = lambdaAtom.descriptions
    .filter(context.checkVisitedAndExecFunc(() => true))
    .map((descId) => {
      const descAtom = context.get(fetchLambdaAtom(descId));
      if ('customTraversal' in descAtom) {
        // custom traversal detected, switch projection
        return descAtom.customTraversal({ ...context, lambdaId: descId, depth: context.depth + 1 });
      } else {
        // no custom traversal, continue flattenTraversal
        return flattenTraversal({ ...context, lambdaId: descId, depth: context.depth + 1 });
      }
    })
    .filter(Boolean) as Lambda[]; // filter out undefineds

  // Ignore connections in the flattened view
  lambda.connections = [];

  return lambda;
};

export const createFlattenVLA = atom(null, (get, set, baseId: LambdaId) => {
  const newVirtualLambdaAtom: Omit<VirtualLambdaAtom, 'id'> = {
    value: '', // or some suitable default value
    descriptions: [],
    connections: [],
    baseId,
    customTraversal: flattenTraversal,
  };

  // Insert the new FlattenVLA into the lattice using the createAndInitializeLambdaAtom
  const newId: LambdaId = set(createAndInitializeLambdaAtom, newVirtualLambdaAtom);

  return get(fetchLambdaAtom(newId));
});
