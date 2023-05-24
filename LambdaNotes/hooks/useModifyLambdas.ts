import { Getter, Setter, atom, useSetAtom } from 'jotai';
import { fetchLambdaAtom, updateLambdaAtom, LambdaAtom, LambdaId } from '../state/atoms';
import { atomFamily } from 'jotai/utils';

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

export const useAddToConnections = (id: LambdaId) => useSetAtom(connectionsAtomFamily(id));
export const useAddTodescriptions = (id: LambdaId) => useSetAtom(descriptionsAtomFamily(id));
