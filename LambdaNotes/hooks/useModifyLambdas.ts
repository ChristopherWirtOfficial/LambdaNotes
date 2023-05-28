import { Getter, Setter, atom } from 'jotai';
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
