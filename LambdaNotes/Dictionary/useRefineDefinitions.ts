import { atom, useAtom, useAtomValue } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { Lambda, LambdaAtom, LambdaId, LambdaPerspectiveGraphAtomFamily } from '../state';
import { LambdaDefinitionAtomFamily } from './getDefinition';
import { OpenAI } from 'langchain/llms/openai';
import { useCallback, useMemo } from 'react';

type LambdaDefinition = Lambda | LambdaAtom | LambdaId;

const model = new OpenAI({
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  temperature: 0.9,
  modelName: 'gpt-3.5-turbo',
});

export const BestDefinitionForLambdaAtomFamily = atomFamily((lambdaId: string) => atom<string | null>(null));

export const useRefineDefinitions = (lambdaDef: LambdaDefinition) => {
  const lambdaId = lambdaDef.hasOwnProperty('id') ? (lambdaDef as Lambda | LambdaAtom).id : (lambdaDef as LambdaId);

  // NOTE: Using/potentially CREATING the entire lambda lattice from this perspective is BAD long term
  //  This is just one of the places to address when moving out of Jotai for ultimate storage and using
  //  some amount of lazy loading of the lattice and a given projection of it anyway though.
  const lambda = useAtomValue(LambdaPerspectiveGraphAtomFamily(lambdaId));
  const definitions = useAtomValue(LambdaDefinitionAtomFamily(lambdaId));

  const flatDescriptionsProjection = useMemo(() => lambda?.descriptions.map((d) => d.value) ?? [], [lambda]);
  const flatConnectionsProjection = useMemo(() => lambda?.connections.map((c) => c.value) ?? [], [lambda]);

  const [bestDefinition, setBestDefinitionForLambda] = useAtom(BestDefinitionForLambdaAtomFamily(lambda.id));

  const refineDefinition = async () => {
    if (!lambda || !definitions) {
      throw new Error('[refineDefinition] Lambda or definitions not found');
    }
    // 1. Get the currently held "best" definition for reference (skip for now)
    // 2. Compile a list of all the definitions that are currently held for the currently selected lambda
    // 3. Ask LLM for the best definition given the context of the currently selected lambda (such as the flat projections above)
    // 4. If the definition is different from the currently held "best" definition, then update the "best" definition

    const disctinctMeanings = definitions?.flatMap((d) => d.meanings.flatMap((m) => m.definitions));

    const definitionsString = disctinctMeanings?.map((def) => def.definition).join('\n');

    if (!definitionsString) {
      throw new Error(`No definitions found for ${lambda.value}`);
    }

    const context = `The term "${
      lambda.value
    }" is currently being used in the following contexts: Descriptions - [${flatDescriptionsProjection.join(
      ', '
    )}]; Connections - [${flatConnectionsProjection.join(', ')}].`;

    const prompt = `${context}\n\nGiven the following definitions:\n${definitionsString}\n\n
  What is the best definition of "${lambda.value}" in this context?
  Please respond ONLY with the definition chosen.
  The first token you generate should be the first token of the definition, and the last the last.`;

    // Pass prompt to LLM
    const response = await model.call(prompt);

    if (response) {
      setBestDefinitionForLambda(response);
    }

    console.log('response', response);
  };

  const refineDefinitionCb = useCallback(refineDefinition, [
    lambda,
    definitions,
    flatDescriptionsProjection,
    flatConnectionsProjection,
    setBestDefinitionForLambda,
  ]);

  return {
    bestDefinition,
    refineDefinition: refineDefinitionCb,
  };
};
