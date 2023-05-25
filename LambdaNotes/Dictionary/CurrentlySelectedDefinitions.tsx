import { useCurrentProjection, useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';
import { Box } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { LambdaDefinitionAtomFamily } from './getDefinition';
import { Editor } from '@monaco-editor/react';

const CurrentlySelectedDefinitions: React.FC = () => {
  const currentProjection = useCurrentProjection();
  const currentlySelectedLambda = useCurrentlySelectedAsRoot(currentProjection);

  const definitions = useAtomValue(LambdaDefinitionAtomFamily(currentlySelectedLambda.id));

  const definitionsJson = useMemo(() => JSON.stringify(definitions, null, 2), [definitions]);

  console.log('definitions', { definitions, definitionsJson });

  const flatDescriptionsProjection = currentlySelectedLambda.descriptions.map((d) => d.value);
  const flatConnectionsProjection = currentlySelectedLambda.connections.map((c) => c.value);

  // TODO: Eventually, each meaning that's considered to not just be a different way of defining the same abtract concept
  //  should really be its own lambda. Like, if we have 10 meanings for fire across different parts of speech, then
  //  we should have 10 lambdas, each with a single meaning. Then, we can have a lambda that's a collection of all
  //  instances of fire.

  return (
    <Box>
      <Box>{JSON.stringify(flatDescriptionsProjection)}</Box>
      <Box>{JSON.stringify(flatConnectionsProjection)}</Box>
      <Editor height="40rem" width="50vw" value={definitionsJson} defaultLanguage="typescript" theme="vs-dark" />
    </Box>
  );
};

export default CurrentlySelectedDefinitions;
