import { Setter, atom, useAtom } from 'jotai';
import { LambdaAtom, LambdaUniverseAtomFamily } from '../state/atoms';
import uuidv4 from '../helpers/uuid';
import { THE_ROOT_UNIVERSE } from '../state/useLambdaRootUniverse';
import { useEffect } from 'react';

type FakeLambda = {
  id: string;
  value: string;
  connections: string[]; // IDs of connected FakeLambdas
  description: string[]; // IDs of FakeLambdas describing this one
};

const initialUniverse: FakeLambda[] = [
  {
    id: '1',
    value: 'Universe',
    connections: [], // No connections at root
    description: ['2', '3', '4'], // IDs of fire, water, and earth
  },
  {
    id: '2',
    value: 'fire',
    connections: ['3', '4'], // IDs of water and earth
    description: ['5', '6'], // IDs of hot and bright
  },
  {
    id: '3',
    value: 'water',
    connections: ['2', '4'], // IDs of fire and earth
    description: ['7', '8'], // IDs of wet and cool
  },
  {
    id: '4',
    value: 'earth',
    connections: ['2', '3'], // IDs of fire and water
    description: ['9', '10'], // IDs of solid and heavy
  },
  {
    id: '5',
    value: 'hot',
    connections: [],
    description: [],
  },
  {
    id: '6',
    value: 'bright',
    connections: [],
    description: [],
  },
  {
    id: '7',
    value: 'wet',
    connections: [],
    description: [],
  },
  {
    id: '8',
    value: 'cool',
    connections: [],
    description: [],
  },
  {
    id: '9',
    value: 'solid',
    connections: [],
    description: [],
  },
  {
    id: '10',
    value: 'heavy',
    connections: [],
    description: [],
  },
];

const fakeIdToGuidMap = new Map<string, string>();

const createLambdaFromFake = (set: Setter, fakeLambda: FakeLambda) => {
  // Generate a new GUID for the lambda
  const newLambdaId = uuidv4();
  // Map the fake ID to the newly generated GUID
  fakeIdToGuidMap.set(fakeLambda.id, newLambdaId);

  // Create a new lambda atom with the value from the fake lambda
  const newLambda: Omit<LambdaAtom, 'id'> = {
    value: fakeLambda.value,
    connections: fakeLambda.connections, // Store the original IDs, will be replaced later
    description: fakeLambda.description, // Store the original IDs, will be replaced later
  };

  // Initialize the corresponding entry in the AtomFamily
  set(LambdaUniverseAtomFamily(newLambdaId), {
    id: newLambdaId,
    ...newLambda,
  });

  // Return the new lambda's ID so it can be used elsewhere if needed
  return newLambdaId;
};

export const setupLambdaUniverseAtom = atom(
  (get) => get(LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE)),
  (get, set) => {
    // Create the atoms for all FakeLambdas in the initialUniverse
    initialUniverse.forEach((fakeLambda) => createLambdaFromFake(set, fakeLambda));

    // Now, all atoms have been created, and we can replace the old IDs in their connections and descriptions with the actual GUIDs.
    fakeIdToGuidMap.forEach((newId, oldId) => {
      const lambda = get(LambdaUniverseAtomFamily(newId));
      lambda.connections = lambda.connections.map((oldConnectionId) => fakeIdToGuidMap.get(oldConnectionId)!);
      lambda.description = lambda.description.map((oldDescriptionId) => fakeIdToGuidMap.get(oldDescriptionId)!);
      set(LambdaUniverseAtomFamily(newId), lambda);
    });

    // Connect the "Universe" to the "Root" (THE_ROOT_UNIVERSE)
    const rootAtom = get(LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE));
    const universeId = fakeIdToGuidMap.get(initialUniverse[0].id); // Get Universe ID directly from initial setup
    if (universeId) {
      rootAtom.connections.push(universeId);
      set(LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE), rootAtom);
    }
  }
);

export const useInitialSetup = () => {
  const [_, setupLambdaUniverse] = useAtom(setupLambdaUniverseAtom);

  useEffect(() => {
    setupLambdaUniverse();
  }, []);
};

export default useInitialSetup;
