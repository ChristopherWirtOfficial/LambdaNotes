import { useCurrentProjection, useCurrentlySelectedAsRoot } from '../state/useCurrentlySelectedLambda';
import { Box } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { LambdaDefinitionAtomFamily } from './getDefinition';
import { Editor } from '@monaco-editor/react';
import { useRefineDefinitions } from './useRefineDefinitions';

const CurrentlySelectedDefinitions: React.FC = () => {
  const currentProjection = useCurrentProjection();
  const lambda = useCurrentlySelectedAsRoot(currentProjection);

  const definitions = useAtomValue(LambdaDefinitionAtomFamily(lambda.id));
  const definitionsJson = JSON.stringify(definitions);

  const { bestDefinition, refineDefinition } = useRefineDefinitions(lambda);

  const flatDescriptionsProjection = useMemo(() => lambda?.descriptions.map((d) => d.value) ?? [], [lambda]);
  const flatConnectionsProjection = useMemo(() => lambda?.connections.map((c) => c.value) ?? [], [lambda]);

  // TODO: Eventually, each meaning that's considered to not just be a different way of defining the same abtract concept
  //  should really be its own lambda. Like, if we have 10 meanings for fire across different parts of speech, then
  //  we should have 10 lambdas, each with a single meaning. Then, we can have a lambda that's a collection of all
  //  instances of fire.

  return (
    <Box>
      <Box p={2}>{JSON.stringify(flatDescriptionsProjection)}</Box>
      <Box p={2}>{JSON.stringify(flatConnectionsProjection)}</Box>
      <Box
        // Make it look like a button on hover
        _hover={{ cursor: 'pointer', textDecoration: 'underline' }}
        p={1}
        onClick={refineDefinition}
      >
        Ask LLM for best definition given context
      </Box>
      <Box minH="3rem" p={2}>
        Best definition: {bestDefinition}
      </Box>
      <Editor height="40rem" width="50vw" value={definitionsJson} defaultLanguage="typescript" theme="vs-dark" />
    </Box>
  );
};

export default CurrentlySelectedDefinitions;
