// NotesView.tsx
import React from 'react';
import { BaseView } from './BaseView';
import { LambdaNotesGraphAtomFamily } from '../state/Projections/LambdaNotesGraphAtomFamily';
import { useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';
import { useAddToConnections, useAddTodescriptions } from '../hooks/useModifyLambdas';

export const NotesView: React.FC = () => {
  const noteViewLambda = useCurrentlySelectedAsRoot(LambdaNotesGraphAtomFamily);
  const addToConnections = useAddToConnections(noteViewLambda.id);
  const addTodescriptions = useAddTodescriptions(noteViewLambda.id);

  return <BaseView lambda={noteViewLambda} addToConnections={addToConnections} addTodescriptions={addTodescriptions} />;
};

export default NotesView;
