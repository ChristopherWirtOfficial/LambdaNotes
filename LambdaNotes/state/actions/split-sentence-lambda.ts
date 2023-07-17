// write-atoms.ts
import { createAndInitializeLambdaAtom, updateLambdaAtom } from '../write-atoms';
import { atom } from 'jotai';
import { LambdaId } from '../types';
import { fetchLambdaAtom } from '..';

// A mapping from character sequences to their respective LambdaId
const CharSequenceToLambdaId = new Map<string, LambdaId>();

// Sentence splitting atom
export const splitSentenceLambdaAtom = atom(undefined, (get, set, lambdaId: LambdaId) => {
  const sentenceLambda = get(fetchLambdaAtom(lambdaId));
  const charSequences = sentenceLambda.value.split(/\b/);

  const words = charSequences.filter((s) => s.match(/\w+/));

  console.log({
    words,
  });

  const wordLambdaIds: LambdaId[] = words.map((word) => {
    if (CharSequenceToLambdaId.has(word)) {
      // If the word already exists, return the existing LambdaId
      return CharSequenceToLambdaId.get(word) as LambdaId;
    } else {
      // Otherwise, create a new LambdaAtom for the word and get its LambdaId
      const newWordLambdaId = set(createAndInitializeLambdaAtom, {
        value: word,
        descriptions: [],
        connections: ['***SENTENCE_WORD***'],
      });

      // Map the character sequence of the word to its new LambdaId
      CharSequenceToLambdaId.set(word, newWordLambdaId);

      return newWordLambdaId;
    }
  });

  // Append the word LambdaIds to the descriptions of the original sentence Lambda
  set(updateLambdaAtom(lambdaId), { descriptions: sentenceLambda.descriptions.concat(wordLambdaIds) });
});
