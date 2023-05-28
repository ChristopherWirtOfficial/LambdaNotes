// NotesView.tsx
import React from 'react';
import { BaseView } from './BaseView';
import { LambdaNotesGraphAtomFamily } from '../state/Projections/LambdaNotesGraphAtomFamily';
import { useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';

export const NotesView: React.FC = () => {
  const noteViewLambda = useCurrentlySelectedAsRoot(LambdaNotesGraphAtomFamily);

  return <BaseView lambda={noteViewLambda} />;
};

export default NotesView;
