/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { DictionaryAPIResponse } from './DictionaryAPITypes';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { Lambda, LambdaAtom, LambdaId } from '../state';

export const getDefinition = async (word: string): Promise<DictionaryAPIResponse[]> => {
  const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  return response.data;
};

// jotai atomFamily for "caching" definitions for any given word
export const DefinitionAtomFamily = atomFamily((word: string) => atom<DictionaryAPIResponse[] | null>(null));

export const LambdaDefinitionAtomFamily = atomFamily((lambdaId: LambdaId) =>
  atom<DictionaryAPIResponse[] | null>(null)
);

// write atom for defining a word, which both returns it and sets it in the atom family
export const getDefinitionAtom = atom(null, async (get, set, { value, id }: Lambda | LambdaAtom) => {
  const definitionAtom = DefinitionAtomFamily(value);
  const definition = get(definitionAtom);

  if (definition) {
    console.log('Got a definition from the cache', { value, definition });
    return definition;
  }

  const newDefinition = await getDefinition(value);
  console.log('Got a definition from the API', { value, newDefinition });

  // set the definition in the atom family for both caching and distribution
  set(definitionAtom, newDefinition);

  // Also store the definition in the lambdaDefinitionAtomFamily by this lambdaId,
  //   mostly for use in the rest of the lattice
  const lambdaDefinitionAtom = LambdaDefinitionAtomFamily(id);
  set(lambdaDefinitionAtom, newDefinition);

  return newDefinition;
});
