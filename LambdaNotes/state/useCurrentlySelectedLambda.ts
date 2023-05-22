import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { LambdaId } from './atoms';
import { addToConnectionsAtom, formConnectionAtom } from './write-atoms';

export const CurrentlySelectedLambda = atom<LambdaId | null>(null);

export const CurrentlyFormingConnection = atom<LambdaId | null>(null);

export const useGlobalEscapeHandler = (onEscape: () => void) => {
  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onEscape]);
};

export const useGlobalCurrentlySelectedLambdaHandling = () => {
  const [, setSelectedLambda] = useAtom(CurrentlySelectedLambda);
  useGlobalEscapeHandler(() => setSelectedLambda(null));
};

export const useGlobalCurrentlyFormingConnectionHandling = () => {
  const [, setFormingConnection] = useAtom(CurrentlyFormingConnection);
  useGlobalEscapeHandler(() => setFormingConnection(null));
};

export const useGlobalLambdaClickHandling = () => {
  useGlobalCurrentlyFormingConnectionHandling();
  useGlobalCurrentlySelectedLambdaHandling();
};

export const useHandleLambdaClick = (id: LambdaId) => {
  const [, setSelectedLambda] = useAtom(CurrentlySelectedLambda);
  const [formingConnection, setFormingConnection] = useAtom(CurrentlyFormingConnection);
  const formConnection = useSetAtom(formConnectionAtom);

  return () => {
    if (formingConnection) {
      console.log("Let's form a new connection!", {
        lambda1Id: formingConnection,
        lambda2Id: id,
      });
      formConnection({ lambda1Id: formingConnection, lambda2Id: id });
      setFormingConnection(null);
    } else {
      setSelectedLambda(id);
    }
  };
};
