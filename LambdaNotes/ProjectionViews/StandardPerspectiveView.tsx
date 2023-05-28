// PerspectiveView.tsx
import React from 'react';
import { BaseView } from './BaseView';
import { LambdaPerspectiveGraphAtomFamily } from '../state/Projections';
import { useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';

export const StandardPerspectiveView: React.FC = () => {
  const perspectiveLambda = useCurrentlySelectedAsRoot(LambdaPerspectiveGraphAtomFamily);

  return <BaseView lambda={perspectiveLambda} />;
};

export default StandardPerspectiveView;
