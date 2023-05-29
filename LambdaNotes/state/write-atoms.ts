// write-atoms.ts
// This file primarily contains atoms that directly manipulate the state of LambdaAtoms
//  within the root universe lambda atom family (LambdaUniverseAtomFamily).
// Its purpose is to handle writing and updating operations on the atom states.

import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { doesLambdaIdExist, fetchLambdaAtom, LambdaUniverseAtomFamily } from './atoms';
import uuidv4 from '../helpers/uuid';
import { LambdaAtom, LambdaId } from './types';

export type LambdaAtomWithOptionalId = Omit<LambdaAtom, 'id'> & Partial<Pick<LambdaAtom, 'id'>>;

// Update a lambda atom by ID
export const updateLambdaAtom = atomFamily((lambdaId: LambdaId) => {
  return atom(undefined, (get, set, update: Partial<LambdaAtom>) => {
    const lambda = get(fetchLambdaAtom(lambdaId));
    set(LambdaUniverseAtomFamily(lambdaId), { ...lambda, ...update });
  });
});

// Atom to directly update a lambda's value given an id and the new value
// Useful when you don't know which lambda you'll be updating when you establish the useSetAtom hook
export const directUpdateLambdaValueAtom = atom(
  undefined,
  (get, set, { lambdaId, newValue }: { lambdaId: LambdaId; newValue: string }) => {
    const oldLambda = get(fetchLambdaAtom(lambdaId));
    set(updateLambdaAtom(lambdaId), { ...oldLambda, value: newValue });
  }
);

// Atom to form a connection between two lambdas
export const formConnectionAtom = atom(
  undefined,
  (get, set, { lambda1Id, lambda2Id }: { lambda1Id: LambdaId; lambda2Id: LambdaId }) => {
    const lambda1 = get(fetchLambdaAtom(lambda1Id));
    const lambda2 = get(fetchLambdaAtom(lambda2Id));
    const updatedLambda1 = {
      ...lambda1,
      connections: Array.from(new Set([...lambda1.connections, lambda2Id])),
    };
    const updatedLambda2 = {
      ...lambda2,
      connections: Array.from(new Set([...lambda2.connections, lambda1Id])),
    };
    set(LambdaUniverseAtomFamily(lambda1Id), updatedLambda1);
    set(LambdaUniverseAtomFamily(lambda2Id), updatedLambda2);
  }
);

export const formDescriptionAtom = atom(
  undefined,
  (get, set, { lambdaId, descriptionId }: { lambdaId: LambdaId; descriptionId: LambdaId }) => {
    const lambda = get(fetchLambdaAtom(lambdaId));
    const updatedLambda = {
      ...lambda,
      descriptions: Array.from(new Set([...lambda.descriptions, descriptionId])),
    };

    const descriptionLambda = get(fetchLambdaAtom(descriptionId));
    const updatedLambda2 = {
      ...descriptionLambda,
      connections: Array.from(new Set([...descriptionLambda.connections, lambdaId])),
    };

    set(LambdaUniverseAtomFamily(lambdaId), updatedLambda);
    set(LambdaUniverseAtomFamily(descriptionId), updatedLambda2);
  }
);

// New lambda creation and initialization atom
export const createAndInitializeLambdaAtom = atom(undefined, (get, set, update: LambdaAtomWithOptionalId) => {
  const newLambdaId = update.id ?? uuidv4();

  const alreadyInLattice = doesLambdaIdExist(newLambdaId);

  if (!alreadyInLattice) {
    set(updateLambdaAtom(newLambdaId), { ...update, id: newLambdaId });
  }

  return newLambdaId;
});

// Atom to break a connection between two lambdas
export const breakConnectionAtom = atom(
  undefined,
  (get, set, { lambda1Id, lambda2Id }: { lambda1Id: LambdaId; lambda2Id: LambdaId }) => {
    const lambda1 = get(fetchLambdaAtom(lambda1Id));
    const lambda2 = get(fetchLambdaAtom(lambda2Id));
    const updatedLambda1 = {
      ...lambda1,
      connections: lambda1.connections.filter((lambdaId) => lambdaId !== lambda2Id),
    };
    const updatedLambda2 = {
      ...lambda2,
      connections: lambda2.connections.filter((lambdaId) => lambdaId !== lambda1Id),
    };
    set(updateLambdaAtom(lambda1Id), updatedLambda1);
    set(updateLambdaAtom(lambda2Id), updatedLambda2);
  }
);
