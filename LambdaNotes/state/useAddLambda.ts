// state/useAddLambda.ts
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { LambdaAtom } from './types';
import { createAndInitializeLambdaAtom } from './write-atoms';

type UseAddLambdaOptions = {
  addToCategory: (newLambdaId: string) => void;
};

export const useAddLambda = ({ addToCategory }: UseAddLambdaOptions) => {
  const [inputValue, setInputValue] = useState('');
  const createLambda = useSetAtom(createAndInitializeLambdaAtom);

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

      const newLambdaId = createLambda(newLambda);
      addToCategory(newLambdaId);
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
