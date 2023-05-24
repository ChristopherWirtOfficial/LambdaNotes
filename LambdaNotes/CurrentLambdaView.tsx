// CurrentLambdaView.tsx
import React, { FC } from 'react';
import { useAtom } from 'jotai';
import { VStack, Heading, Select } from '@chakra-ui/react';
import { atom } from 'jotai';

import StandardPerspectiveView from './ProjectionViews/StandardPerspectiveView';
import AccordionView from './ProjectionViews/AccordionView';
import NotesView from './ProjectionViews/NotesView';

const LAMBDA_VIEWS = {
  AccordionView,
  StandardPerspectiveView,
  NotesView,
};

// Define a new atom to hold the current selection of projection.
const currentProjectionAtom = atom<keyof typeof LAMBDA_VIEWS>('NotesView');

export const CurrentLambdaView: FC = () => {
  const [currentProjection, setCurrentProjection] = useAtom(currentProjectionAtom);

  const handleProjectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjection = e.target.value as keyof typeof LAMBDA_VIEWS;
    if (!LAMBDA_VIEWS[newProjection]) {
      throw new Error(`Invalid projection: ${e.target.value}`);
    }

    setCurrentProjection(newProjection);
  };

  const options = Object.keys(LAMBDA_VIEWS);

  return (
    <VStack>
      <Heading as="h2" size="lg" color="white">
        Currently Selected
      </Heading>
      <Select value={currentProjection} onChange={handleProjectionChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      {React.createElement(LAMBDA_VIEWS[currentProjection])}
    </VStack>
  );
};

export default CurrentLambdaView;
