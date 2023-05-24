// AccordianView.tsx
import React from 'react';
import { BaseView } from './BaseView';
import { useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';
import { useAddToConnections, useAddTodescriptions } from '../hooks/useModifyLambdas';
import { LambdaAccordionGraphAtomFamily } from '../state/Projections/LambdaAccordionGraphAtomFamily';
import { THE_ROOT_UNIVERSE } from '../state/useLambdaRootUniverse';

const LambdaTowardRootAccordionViewAtomFamily = LambdaAccordionGraphAtomFamily(THE_ROOT_UNIVERSE);

export const AccordionView: React.FC = () => {
  const accordionViewLambdaToRoot = useCurrentlySelectedAsRoot(LambdaTowardRootAccordionViewAtomFamily);
  const addToConnections = useAddToConnections(accordionViewLambdaToRoot.id);
  const addTodescriptions = useAddTodescriptions(accordionViewLambdaToRoot.id);

  return (
    <BaseView
      lambda={accordionViewLambdaToRoot}
      addToConnections={addToConnections}
      addTodescriptions={addTodescriptions}
    />
  );
};

export default AccordionView;
