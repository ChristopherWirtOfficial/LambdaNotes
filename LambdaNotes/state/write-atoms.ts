import { atom } from 'jotai';
import uuidv4 from '../helpers/uuid';
import { LambdaAtom, LambdaId, LambdaUniverseAtomFamily } from './atoms';

export type LambdaAtomWithOptionalId = Omit<LambdaAtom, 'id'> & Partial<Pick<LambdaAtom, 'id'>>;

// New lambda creation and initialization atom
export const createAndInitializeLambdaAtom = atom(undefined, (get, set, update: LambdaAtomWithOptionalId) => {
  const newLambdaId = update.id ?? uuidv4();
  set(LambdaUniverseAtomFamily(newLambdaId), {
    ...update,
    id: newLambdaId,
  });
  return newLambdaId;
});

// Atom to update a specific lambda
export const updateLambdaAtom = atom(undefined, (get, set, update: LambdaAtom) => {
  const lambdaToUpdate = get(LambdaUniverseAtomFamily(update.id));
  const updatedLambda = {
    ...lambdaToUpdate,
    ...update,
  };
  set(LambdaUniverseAtomFamily(update.id), updatedLambda);
});

// Atom to form a connection between two lambdas
export const formConnectionAtom = atom(
  undefined,
  (get, set, { lambda1Id, lambda2Id }: { lambda1Id: LambdaId; lambda2Id: LambdaId }) => {
    const lambda1 = get(LambdaUniverseAtomFamily(lambda1Id));
    const lambda2 = get(LambdaUniverseAtomFamily(lambda2Id));
    const updatedLambda1 = {
      ...lambda1,
      connections: [...lambda1.connections, lambda2Id],
    };
    const updatedLambda2 = {
      ...lambda2,
      connections: [...lambda2.connections, lambda1Id],
    };
    set(LambdaUniverseAtomFamily(lambda1Id), updatedLambda1);
    set(LambdaUniverseAtomFamily(lambda2Id), updatedLambda2);
  }
);

// Atom to break a connection between two lambdas
export const breakConnectionAtom = atom(
  undefined,
  (get, set, { lambda1Id, lambda2Id }: { lambda1Id: LambdaId; lambda2Id: LambdaId }) => {
    const lambda1Atom = LambdaUniverseAtomFamily(lambda1Id);
    const lambda2Atom = LambdaUniverseAtomFamily(lambda2Id);
    const lambda1 = get(lambda1Atom);
    const lambda2 = get(lambda2Atom);
    const updatedLambda1 = {
      ...lambda1,
      connections: lambda1.connections.filter((lambdaId) => lambdaId !== lambda2Id),
    };
    const updatedLambda2 = {
      ...lambda2,
      connections: lambda2.connections.filter((lambdaId) => lambdaId !== lambda1Id),
    };
    set(lambda1Atom, updatedLambda1);
    set(lambda2Atom, updatedLambda2);
  }
);

// Atom to add lambda to description
export const addToDescriptionAtom = atom(
  undefined,
  (get, set, { lambdaId, descriptionId }: { lambdaId: LambdaId; descriptionId: LambdaId }) => {
    const lambda = get(LambdaUniverseAtomFamily(lambdaId));
    const updatedLambda = {
      ...lambda,
      description: [...lambda.description, descriptionId],
    };
    set(LambdaUniverseAtomFamily(lambdaId), updatedLambda);
  }
);

// Atom to add lambda to connections
export const addToConnectionsAtom = atom(
  undefined,
  (get, set, { lambdaId, connectionId }: { lambdaId: LambdaId; connectionId: LambdaId }) => {
    const lambda = get(LambdaUniverseAtomFamily(lambdaId));
    const updatedLambda = {
      ...lambda,
      connections: [...lambda.connections, connectionId],
    };
    set(LambdaUniverseAtomFamily(lambdaId), updatedLambda);
  }
);
