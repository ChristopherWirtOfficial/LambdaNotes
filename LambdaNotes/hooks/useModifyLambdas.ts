import { Getter, Setter, atom, useSetAtom } from 'jotai';
import { fetchLambdaAtom, updateLambdaAtom } from '../state/atoms';
import { atomFamily } from 'jotai/utils';
import { LambdaAtom, LambdaId } from '../state';

export interface AtomFactoryParams {
  getField: (lambda: LambdaAtom) => LambdaId[];
  setField: (lambda: LambdaAtom, newValue: LambdaId[]) => LambdaAtom;
}

export const createAtomFamily = ({ getField, setField }: AtomFactoryParams) =>
  atomFamily((id: LambdaId) =>
    atom(
      (get) => get(fetchLambdaAtom(id)),
      (get: Getter, set: Setter, newValueId: LambdaId) => {
        const lambda = get(fetchLambdaAtom(id));
        const fieldValues: LambdaId[] = getField(lambda) || [];
        set(updateLambdaAtom(id), setField(lambda, [...fieldValues, newValueId]));
      }
    )
  );

export const connectionsAtomFamily = createAtomFamily({
  getField: (lambda) => lambda.connections,
  setField: (lambda, newConnections) => ({ ...lambda, connections: newConnections }),
});

export const descriptionsAtomFamily = createAtomFamily({
  getField: (lambda) => lambda.descriptions,
  setField: (lambda, newdescriptions) => ({ ...lambda, descriptions: newdescriptions }),
});

// TODO: Any given new description needs to use `formDescription`, and any given connection needs to use `formConnection`
//        This is super important because every connection of kind is always considered bi-directional in one way or another
//          forcing the lattice to always be fully connected from ANY Lambda in the lattice.
export const useAddToConnections = (id: LambdaId) => useSetAtom(connectionsAtomFamily(id));
export const useAddTodescriptions = (id: LambdaId) => useSetAtom(descriptionsAtomFamily(id));
