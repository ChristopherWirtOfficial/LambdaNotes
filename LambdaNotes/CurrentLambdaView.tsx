// CurrentLambdaView.tsx
import React, { FC } from 'react';
import { useAtom } from 'jotai';
import { VStack, Heading, Select } from '@chakra-ui/react';
import { atom } from 'jotai';

import StandardPerspectiveView from './ProjectionViews/StandardPerspectiveView';
import NotesView from './ProjectionViews/NotesView';

// Define a new atom to hold the current selection of projection.
const currentProjectionAtom = atom('note'); // 'perspective' or 'note'

export const CurrentLambdaView: FC = () => {
  const [currentProjection, setCurrentProjection] = useAtom(currentProjectionAtom);

  const handleProjectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentProjection(e.target.value);
  };

  return (
    <VStack>
      <Heading as="h2" size="lg" color="white">
        Currently Selected
      </Heading>
      <Select value={currentProjection} onChange={handleProjectionChange}>
        <option value="perspective">Perspective View</option>
        <option value="note">Note View</option>
      </Select>
      {currentProjection === 'perspective' ? <StandardPerspectiveView /> : <NotesView />}
    </VStack>
  );
};

export default CurrentLambdaView;
