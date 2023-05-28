import { Setter, atom, useAtom } from 'jotai';
import { LambdaUniverseAtomFamily } from '../state/atoms';
import uuidv4 from '../helpers/uuid';
import { THE_ROOT_UNIVERSE } from '../state/useLambdaRootUniverse';
import { useEffect } from 'react';
import { LambdaAtom } from '../state';

type FakeLambda = {
  id: string;
  value: string;
  connections: string[]; // IDs of connected FakeLambdas
  descriptions: string[]; // IDs of FakeLambdas describing this one
};

const initialUniverse: FakeLambda[] = [
  {
    id: '1',
    value: 'Universe',
    connections: ['0'], // No connections at root
    descriptions: ['2', '3', '4'], // IDs of fire, water, and earth
  },
  {
    id: '2',
    value: 'Fire',
    connections: ['1', '3', '4'], // IDs of water and earth
    descriptions: ['5', '6'], // IDs of hot and bright
  },
  {
    id: '3',
    value: 'Water',
    connections: ['2', '4', '5', '6'], // IDs of fire, earth, hot, bright
    descriptions: ['7', '8'], // IDs of wet and cool
  },
  {
    id: '4',
    value: 'Earth',
    connections: ['2', '3', '5', '6', '7', '8'], // IDs of fire, water, hot, bright, wet, cool
    descriptions: ['9', '10'], // IDs of solid and heavy
  },
  {
    id: '5',
    value: 'Hot',
    connections: ['2', '3', '4', '7', '8', '9', '10'], // IDs of fire, water, earth, wet, cool, solid, heavy
    descriptions: [], // No descriptions
  },
  {
    id: '6',
    value: 'Bright',
    connections: ['2', '3', '4', '7', '8', '9', '10'], // IDs of fire, water, earth, wet, cool, solid, heavy
    descriptions: [], // No descriptions
  },
  {
    id: '7',
    value: 'Wet',
    connections: ['3', '4', '5', '6'], // IDs of water, earth, hot, bright
    descriptions: [], // No descriptions
  },
  {
    id: '8',
    value: 'Cool',
    connections: ['3', '4', '5', '6'], // IDs of water, earth, hot, bright
    descriptions: [], // No descriptions
  },
  {
    id: '9',
    value: 'Solid',
    connections: ['4', '5', '6'], // IDs of earth, hot, bright
    descriptions: [], // No descriptions
  },
  {
    id: '10',
    value: 'Heavy',
    connections: ['4', '5', '6'], // IDs of earth, hot, bright
    descriptions: [], // No descriptions
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
    descriptions: [], // Initialize as empty. Will populate below.
  };

  // Recursively process the connections and descriptions, converting their fakeIds into real GUIDs.
  fakeLambda.connections.forEach((connectionId) => {
    const realId = setupUniverseRecursively(connectionId, set);
    newLambda.connections.push(realId!);
  });

  fakeLambda.descriptions.forEach((descriptionsId) => {
    const realId = setupUniverseRecursively(descriptionsId, set);
    newLambda.descriptions.push(realId!);
  });

  // Update the newly created lambda atom with its connections and descriptions
  set(LambdaUniverseAtomFamily(newLambdaId), newLambda);

  return newLambdaId;
};

export const setupLambdaUniverseAtom = atom(
  (get) => get(LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE)),
  (get, set) => {
    fakeIdToGuidMap.set('0', THE_ROOT_UNIVERSE); // Map the fake root ID to the real root ID

    // Start the recursive setup process with the root node
    const newUniverseRootId = setupUniverseRecursively('1', set); // Assuming '1' is the id of root in your initialUniverse

    // Make the newUniverseRootId a descriptions child of the root universe
    const rootUniverseAtom = LambdaUniverseAtomFamily(THE_ROOT_UNIVERSE);
    const rootUniverse = get(rootUniverseAtom);

    // Add the new root to the root universe's descriptions
    // use descriptionsAtomFamily to modify the root lambda's descriptions
    set(rootUniverseAtom, {
      ...rootUniverse,
      descriptions: [...rootUniverse.descriptions, newUniverseRootId],
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
