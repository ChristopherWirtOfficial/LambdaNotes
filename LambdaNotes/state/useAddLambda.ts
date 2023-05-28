// state/useAddLambda.ts
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { LambdaAtom } from './types';
import { createAndInitializeLambdaAtom, formConnectionAtom, formDescriptionAtom } from './write-atoms';

export type LambdaRelationshipType = 'connection' | 'description';

type UseAddLambdaOptions = {
  parentLambdaId: string;
  relationship: LambdaRelationshipType;
};

export const useAddLambda = ({ parentLambdaId, relationship }: UseAddLambdaOptions) => {
  const [inputValue, setInputValue] = useState('');
  const createLambda = useSetAtom(createAndInitializeLambdaAtom);
  const formConnection = useSetAtom(formConnectionAtom);
  const formDescription = useSetAtom(formDescriptionAtom);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue.trim()) {
      const newLambda: Omit<LambdaAtom, 'id'> = {
        value: inputValue,
        connections: [],
        descriptions: [],
      };

      // Create the new lambda
      const newLambdaId = createLambda(newLambda);

      // Add the new lambda to its parent's selected category (connections or descriptions)
      if (relationship === 'connection') {
        formConnection({ lambda1Id: parentLambdaId, lambda2Id: newLambdaId });
      } else if (relationship === 'description') {
        formDescription({ lambdaId: parentLambdaId, descriptionId: newLambdaId });
      }
      setInputValue('');
    }
  };

  return {
    inputValue,
    handleInputChange,
    handleFormSubmit,
  };
};

export default useAddLambda;
