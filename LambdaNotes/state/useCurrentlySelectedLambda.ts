import { atom, useAtom } from 'jotai';
import { LambdaId } from './atoms';
import { useEffect } from 'react';

export const CurrentlySelectedLambda = atom<LambdaId | null>(null);

// Used by the root to clear the currently selected lambda when the user hits escape
export const useGlobalCurrentlySelectedLambdaHandling = () => {
  const [, setSelectedLambda] = useAtom(CurrentlySelectedLambda);

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedLambda(null);
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setSelectedLambda]);
};
