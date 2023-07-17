import { OpenAI } from 'langchain/llms/openai';
import { Quality } from './QualityRefiner';
import { useCallback } from 'react';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain';

const model = new OpenAI({
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  temperature: 0.9,
  modelName: 'gpt-3.5-turbo',
});

const template = `
  Given the following "qualities" of some concept or term you're being asked to guess, what do you think the most likely answer is?
  Similarly, what do you think the BEST answer is?
  Lastly, what do you think the WORST answer is that satisfies the majority of the individual spirits of the qualities, but not the spirit of their collective?

  It's possible that the best answer for these is the same. That possibility is, ideally, an inevitability for this prompt to meet.
  If it seems to be a good answer for all three, then perhaps this is just one of many future iterations of the qualities being
  guessed from, and it's simply too "hard" to challenge or deviate from what appears "obviously true". This goal is ideal, but 
  again perhaps not the case. If it's not the case, then the qualities are not yet "good enough" to be guessed from, apparently.

  {qualities}

  {formatInstructions}
`;

const outputNamesAndDescriptions = {
  mostLikely: 'The answer that seems most likely to fit the spirit of the qualities as specified',
  best: 'The answer that, regardless of that spirit, matches the typical interpretation of the qualities almost-individually',
  worst:
    'The answer that, regardless of the spirit of the whole, matches the typical interpretation of many qualities when deliberately, near-adversarially, misinterpreted',
};

export type Answers = {
  mostLikely: string;
  best: string;
  worst: string;
};

export const useGuesser = () => {
  const askForGuessImpl = async (qualities: Quality[]) => {
    // With a `StructuredOutputParser` we can define a schema for the output.
    const parser = StructuredOutputParser.fromNamesAndDescriptions(outputNamesAndDescriptions);

    const formatInstructions = parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['qualities'],
      partialVariables: {
        // Anything to inject right now
        formatInstructions,
      },
    });

    const input = await prompt.format({
      qualities: qualities.map((q) => q.toString()).join('\n'),
    });
    const response = await model.call(input);

    console.log('response', response);

    const answers = (await parser.parse(response)) as Answers;

    return answers;
  };

  const askForGuess = useCallback(askForGuessImpl, []);

  return {
    askForGuess,
  };
};
