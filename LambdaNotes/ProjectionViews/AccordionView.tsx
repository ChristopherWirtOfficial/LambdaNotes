// AccordianView.tsx
import React from 'react';
import { BaseView } from './BaseView';
import { useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';
import { LambdaAccordionGraphAtomFamily } from '../state/Projections/LambdaAccordionGraphAtomFamily';
import { THE_ROOT_UNIVERSE } from '../state/useLambdaRootUniverse';

const LambdaTowardRootAccordionViewAtomFamily = LambdaAccordionGraphAtomFamily(THE_ROOT_UNIVERSE);

export const AccordionView: React.FC = () => {
  const accordionViewLambdaToRoot = useCurrentlySelectedAsRoot(LambdaTowardRootAccordionViewAtomFamily);

  return <BaseView lambda={accordionViewLambdaToRoot} />;
};

export default AccordionView;
