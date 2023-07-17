import { atom } from 'jotai';
import { LambdaId, fetchLambdaAtom } from '../state';
import uuidv4 from '../helpers/uuid';

export interface LambdaAction {
  id: string;
  action: () => unknown;
  automatic?: boolean;
  name: string;
  primaryLambdas?: LambdaId[];
  relatedLambdas?: LambdaId[];
}

export const actionQueueAtom = atom<LambdaAction[]>([]);
export const potentialActionAtom = atom<LambdaAction | null>(null);

export const potentialActionLambdasAtom = atom((get) => {
  const potentialAction = get(potentialActionAtom);

  const potentialActionLambdas = potentialAction?.primaryLambdas?.map((L) => get(fetchLambdaAtom(L)));

  return potentialActionLambdas;
});

// Write atom for popping an action from the queue
export const popActionAtom = atom(null, (get, set) => {
  const actionQueue = get(actionQueueAtom);
  const nextAction = actionQueue.shift();
  set(actionQueueAtom, [...actionQueue]);
  set(potentialActionAtom, nextAction || null);
});

// Write atom for executing an action
export const executeActionAtom = atom(null, (get, set) => {
  const potentialAction = get(potentialActionAtom);
  if (potentialAction) {
    potentialAction.action();
    set(popActionAtom);
  }
});

// Write atom for deleting an action
export const deleteActionAtom = atom(null, (get, set) => {
  set(potentialActionAtom, null);
  set(popActionAtom);
});

export const addActionAtom = atom(null, (get, set, newAction: Omit<LambdaAction, 'id'>) => {
  const actionQueue = get(actionQueueAtom);

  const action = {
    ...newAction,
    id: `Lambda Action - ${uuidv4()}`,
  };

  set(actionQueueAtom, [...actionQueue, action]);
});
