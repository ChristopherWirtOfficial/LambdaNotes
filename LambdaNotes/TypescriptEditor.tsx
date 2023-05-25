import React, { useEffect, useMemo, useRef } from 'react';
import { VStack } from '@chakra-ui/react';
import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import { useCurrentlySelectedAsRoot } from './state/useCurrentlySelectedLambda';
import { LambdaNotesGraphAtomFamily } from './state/Projections/LambdaNotesGraphAtomFamily';
import { useSetAtom } from 'jotai';
import { directUpdateLambdaValueAtom } from './state/write-atoms';
import { Global, css } from '@emotion/react';
import { editor as monacoEditor } from 'monaco-editor';

import { useEditorInstance } from './hooks/useEditor';

const globalStyles = css`
  .myMarker {
    background: rgba(111, 99, 200, 0.3);
  }
`;

const TypeScriptEditor = () => {
  const monaco = useMonaco();
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor>();
  const notesRoot = useCurrentlySelectedAsRoot(LambdaNotesGraphAtomFamily);
  const updateLambdaValue = useSetAtom(directUpdateLambdaValueAtom);
  const [editorMounted, setEditorMounted] = React.useState(false);
  const [decorationIds, setDecorationIds] = React.useState<Map<string, string>>(new Map());

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    setEditorMounted(true);
  };

  // TODO: Currently works, but none of the higher order function of the useEditorInstance hook does anything, I think
  const handleEditorDidMountWithStore = useEditorInstance(handleEditorDidMount);

  const descriptionsLambasAsText = useMemo(
    () =>
      notesRoot.descriptions.reduce((acc, curr) => {
        return acc ? `${acc}\n\n${curr.value}` : curr.value;
      }, ''),
    [notesRoot.descriptions]
  );

  useEffect(() => {
    if (!editorMounted || !monaco || !editorRef.current) {
      return;
    }

    const editor = editorRef.current;
    const model = editor.getModel();
    const newDecorationIds = new Map<string, string>();

    const decorations = notesRoot.descriptions.map((lambda, index) => {
      const startLineNumber = 2 * index + 1;
      const endLineNumber = startLineNumber;
      const startColumn = 1;
      const endColumn = lambda.value.length + 1;

      return {
        range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn),
        options: {
          isWholeLine: false,
          className: 'myMarker',
          hoverMessage: { value: `Lambda ID: ${lambda.id}` },
        },
      };
    });

    if (model) {
      // Remove old decorations
      model.deltaDecorations([...decorationIds.values()], []);
      // Add new decorations and store the ids
      const ids = model.deltaDecorations([], decorations);
      ids.forEach((id, index) => newDecorationIds.set(notesRoot.descriptions[index].id, id));
      setDecorationIds(newDecorationIds);
    }
  }, [notesRoot, monaco, descriptionsLambasAsText, editorMounted]);

  useEffect(() => {
    if (!editorMounted || !monaco || !editorRef.current) {
      return;
    }

    const editor = editorRef.current;
    const model = editor.getModel();

    editor.onDidChangeModelContent((e: monacoEditor.IModelContentChangedEvent) => {
      e.changes.forEach((change: monacoEditor.IModelContentChange) => {
        const changedDecorations = Array.from(decorationIds.entries()).filter(([, id]) =>
          model?.getDecorationRange(id)?.intersectRanges(change.range)
        );

        changedDecorations.forEach(([lambdaId, decorationId]) => {
          const lambdaRange = model?.getDecorationRange(decorationId);
          if (!lambdaRange) {
            return;
          }
          const updatedText = model?.getValueInRange(lambdaRange);
          if (!updatedText) {
            return;
          }
          updateLambdaValue({ lambdaId, newValue: updatedText });
        });
      });
    });
  }, [monaco, updateLambdaValue, editorMounted, decorationIds]);

  return (
    <VStack width="100%" height="100%">
      <Global styles={globalStyles} />
      <Editor
        height="90vh"
        width="50vw"
        defaultValue={descriptionsLambasAsText}
        defaultLanguage="typescript"
        theme="vs-dark"
        onMount={handleEditorDidMountWithStore}
      />
    </VStack>
  );
};

export default TypeScriptEditor;
