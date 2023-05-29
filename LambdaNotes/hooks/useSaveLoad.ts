import { atom, useSetAtom } from 'jotai';
import { LambdaAtom, LambdaUniverseList, createAndInitializeLambdaAtom, fetchLambdaAtom } from '../state';

const SerializeLambdaLatticeAtom = atom(null, (get) => {
  const allLambdaIds = [...LambdaUniverseList.values()];

  const lattice: LambdaAtom[] = allLambdaIds.map((lambdaId) => {
    const lambda = get(fetchLambdaAtom(lambdaId));

    return {
      id: lambda.id,
      value: lambda.value,
      descriptions: lambda.descriptions,
      connections: lambda.connections,
    };
  });

  return lattice;
});

const LoadSerializedLambdaLatticeAtom = atom(null, (get, set, serializedLattice: LambdaAtom[]) => {
  serializedLattice.forEach((lambda) => {
    set(createAndInitializeLambdaAtom, lambda);
  });
});

export const useSaveLoadLattice = () => {
  const getSerializableLattice = useSetAtom(SerializeLambdaLatticeAtom);
  const loadSerializedLattice = useSetAtom(LoadSerializedLambdaLatticeAtom);

  const saveToLocalStorage = () => {
    const serializableLattice = getSerializableLattice();
    localStorage.setItem('lambdaLattice', JSON.stringify(serializableLattice));
  };

  const loadFromLocalStorage = () => {
    const savedLattice = localStorage.getItem('lambdaLattice');
    if (savedLattice) {
      const parsedLattice: LambdaAtom[] = JSON.parse(savedLattice);
      loadSerializedLattice(parsedLattice);
    }
  };

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
  };
};
