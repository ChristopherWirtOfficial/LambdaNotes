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
const initialUniverseMap = new Map<string, FakeLambda>(initialUniverse.map((fl) => [fl.id, fl]));

const setupUniverseRecursively = (fakeId: string, set: Setter) => {
  // If this fakeId is already in the map, then we've processed this node already.
  if (fakeIdToGuidMap.has(fakeId)) {
    return fakeIdToGuidMap.get(fakeId)!;
  }

  // Fetch the FakeLambda
  const fakeLambda = initialUniverseMap.get(fakeId);
  if (!fakeLambda) {
    throw new Error(`Invalid fakeId: ${fakeId}`);
  }

  // Generate a new GUID for the lambda
  const newLambdaId = uuidv4();

  // Map the fake ID to the newly generated GUID
  fakeIdToGuidMap.set(fakeId, newLambdaId);

  // Create a new lambda atom
  const newLambda: LambdaAtom = {
    id: newLambdaId,
    value: fakeLambda.value,
    connections: [], // Initialize as empty. Will populate below.
    description: [], // Initialize as empty. Will populate below.
  };

  // Recursively process the connections and descriptions, converting their fakeIds into real GUIDs.
  fakeLambda.connections.forEach((connectionId) => {
    const realId = setupUniverseRecursively(connectionId, set);
    newLambda.connections.push(realId!);
  });

  fakeLambda.description.forEach((descriptionId) => {
    const realId = setupUniverseRecursively(descriptionId, set);
    newLambda.description.push(realId!);
  });

  // Update the newly created lambda atom with its connections and descriptions
  set(LambdaUniverseAtomFamily(newLambdaId), newLambda);

  return newLambdaId;
};

export const setupLambdaUniverseAtom = atom(
  (get) => get(LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE)),
  (get, set) => {
    // Start the recursive setup process with the root node
    const newUniverseRootId = setupUniverseRecursively('1', set); // Assuming '1' is the id of root in your initialUniverse

    // Make the newUniverseRootId a description child of the root universe
    const rootUniverseAtom = LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE);
    const rootUniverse = get(rootUniverseAtom);

    // Add the new root to the root universe's description
    // use descriptionAtomFamily to modify the root lambda's description
    set(rootUniverseAtom, {
      ...rootUniverse,
      description: [...rootUniverse.description, newUniverseRootId],
    });
  }
);

export const useInitialSetup = () => {
  const [_, setupLambdaUniverse] = useAtom(setupLambdaUniverseAtom);

  useEffect(() => {
    setupLambdaUniverse();
  }, [setupLambdaUniverse]);
};

export default useInitialSetup;
