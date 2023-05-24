import { atomFamily } from 'jotai/utils';
import { atom } from 'jotai';
import { LambdaId, fetchLambdaAtom, updateLambdaAtom } from './atoms';

type ArrayKeysLambdaAtom = 'description' | 'connections';

// Add to an array within a lambda atom
export const addToArrayInLambdaAtom = atomFamily((params: { lambdaId: LambdaId; arrayName: ArrayKeysLambdaAtom }) => {
  return atom(undefined, (get, set, newElement: string) => {
    const lambda = get(fetchLambdaAtom(params.lambdaId));
    const updatedLambda = {
      ...lambda,
      [params.arrayName]: Array.from(new Set([...lambda[params.arrayName], newElement])),
    };
    set(updateLambdaAtom(params.lambdaId), updatedLambda);
  });
});
