// NotesView.tsx
import React from 'react';
import { BaseView } from './BaseView';
import { NoteViewAtomFamily } from '../state/Projections/NoteViewAtomFamily';
import { useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';
import { useAddToConnections, useAddToDescription } from '../hooks/useModifyLambdas';

export const NotesView: React.FC = () => {
  const noteViewLambda = useCurrentlySelectedAsRoot(NoteViewAtomFamily);
  const addToConnections = useAddToConnections(noteViewLambda.id);
  const addToDescription = useAddToDescription(noteViewLambda.id);

  return <BaseView lambda={noteViewLambda} addToConnections={addToConnections} addToDescription={addToDescription} />;
};

export default NotesView;
