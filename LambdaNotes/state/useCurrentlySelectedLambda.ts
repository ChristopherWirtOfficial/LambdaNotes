import { Atom, atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { LambdaUniverseAtomFamily } from './atoms';
import { THE_ROOT_UNIVERSE } from './useLambdaRootUniverse';
import { formConnectionAtom } from './write-atoms';
import { AtomFamily } from 'jotai/vanilla/utils/atomFamily';
import { Lambda, LambdaId } from './types';

import StandardPerspectiveView from '../ProjectionViews/StandardPerspectiveView';
import AccordionView from '../ProjectionViews/AccordionView';
import NotesView from '../ProjectionViews/NotesProjectionView';

import {
  LambdaPerspectiveGraphAtomFamily,
  LambdaAccordionGraphAtomFamily,
  LambdaNotesGraphAtomFamily,
} from '../state/Projections';

export const LAMBDA_VIEWS = {
  AccordionView,
  StandardPerspectiveView,
  NotesView,
};

type ViewKeys = keyof typeof LAMBDA_VIEWS;
type ProjectionAtomFamilyType = AtomFamily<LambdaId, Atom<Lambda> | Atom<Lambda | undefined>>;

export const LAMBDA_PROJECTIONS: Record<ViewKeys, ProjectionAtomFamilyType> = {
  AccordionView: LambdaAccordionGraphAtomFamily(THE_ROOT_UNIVERSE),
  StandardPerspectiveView: LambdaPerspectiveGraphAtomFamily,
  NotesView: LambdaNotesGraphAtomFamily,
};

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

export const useCurrentlySelectedAsRoot = (
  projectionAtomFamily: AtomFamily<LambdaId, Atom<Lambda> | Atom<Lambda | undefined>>
) => {
  const currentlySelectedId = useAtomValue(CurrentlySelectedLambda);
  const currentlySelectedLambda = useAtomValue(LambdaUniverseAtomFamily(currentlySelectedId || THE_ROOT_UNIVERSE));

  const projectionAtom = projectionAtomFamily(currentlySelectedLambda.id);
  const rootUniverse = useAtomValue(projectionAtom);

  if (!rootUniverse) {
    throw new Error('No root universe found');
  }

  return rootUniverse;
};

// Define a new atom to hold the current selection of projection.
export const currentProjectionAtom = atom<keyof typeof LAMBDA_VIEWS>('NotesView');

// A hook to get the current projection.

export const useCurrentProjection = () => {
  return LAMBDA_PROJECTIONS[useAtomValue(currentProjectionAtom)];
};
