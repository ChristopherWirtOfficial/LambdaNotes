// PerspectiveView.tsx
import React from 'react';
import { BaseView } from './BaseView';
import { LambdaPerspectiveGraphAtomFamily } from '../state/Projections';
import { useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';
import { useAddToConnections, useAddTodescriptions } from '../hooks/useModifyLambdas';

export const StandardPerspectiveView: React.FC = () => {
  const perspectiveLambda = useCurrentlySelectedAsRoot(LambdaPerspectiveGraphAtomFamily);
  const addToConnections = useAddToConnections(perspectiveLambda.id);
  const addTodescriptions = useAddTodescriptions(perspectiveLambda.id);

  return (
    <BaseView lambda={perspectiveLambda} addToConnections={addToConnections} addTodescriptions={addTodescriptions} />
  );
};

export default StandardPerspectiveView;
