import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { VStack } from '@chakra-ui/react';
import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import { useCurrentlySelectedAsRoot } from './state/useCurrentlySelectedLambda';
import { NoteViewAtomFamily } from './state/Projections/NoteViewAtomFamily';
import { useSetAtom } from 'jotai';
import { directUpdateLambdaValueAtom } from './state/write-atoms';
import { Global, css } from '@emotion/react';
import { editor as monacoEditor } from 'monaco-editor';

import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { useEditorInstance } from './hooks/useEditor';

const globalStyles = css`
  .myMarker {
    background: rgba(111, 99, 200, 0.3);
  }
`;

const TypeScriptEditor = () => {
  const monaco = useMonaco();
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor>(); // reference to store the editor instance
  const notesRoot = useCurrentlySelectedAsRoot(NoteViewAtomFamily);
  const updateLambdaValue = useSetAtom(directUpdateLambdaValueAtom);

  const [editorMounted, setEditorMounted] = React.useState(false);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    setEditorMounted(true);
  };

  // TODO:PICKUP -- I'm only halfway through - if even - with this refactor. Too much is in both spots now.
  //               Most of the stuff that works is still in here, we just pass through the useful events in our handler below lol
  const handleEditorDidMountWithStore = useEditorInstance(handleEditorDidMount);

  console.log('notesRoot: ', notesRoot);

  const descriptionLambasAsText = useMemo(
    () =>
      notesRoot.description.reduce((acc, curr) => {
        return acc ? `${acc}\n\n${curr.value}` : curr.value;
      }, ''),
    [notesRoot.description]
  );

  useEffect(() => {
    if (!editorMounted || !monaco || !editorRef.current) {
      return;
    }

    const editor = editorRef.current;
    const model = editor.getModel();

    const lineNumberLambdaIdMap = new Map(); // local map
    const decorations = notesRoot.description.map((lambda, index) => {
      const startLineNumber = 2 * index + 1;
      const endLineNumber = startLineNumber;
      const startColumn = 1;
      const endColumn = lambda.value.length + 1;

      lineNumberLambdaIdMap.set(startLineNumber, lambda.id);

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
      model.deltaDecorations([], decorations);
    }

    editor.onDidChangeModelContent((e: monacoEditor.IModelContentChangedEvent) => {
      e.changes.forEach((change: monacoEditor.IModelContentChange) => {
        const lambdaId = lineNumberLambdaIdMap.get(change.range.startLineNumber);
        if (lambdaId) {
          console.log('Updating lambda id: ', lambdaId, ' with new value: ', change.text);
          updateLambdaValue({ lambdaId, newValue: change.text });
        }
      });
    });
  }, [notesRoot, monaco, updateLambdaValue, descriptionLambasAsText, editorMounted]);

  return (
    <VStack width="100%" height="100%">
      <Global styles={globalStyles} />
      <Editor
        height="90vh"
        width="50vw"
        defaultValue={descriptionLambasAsText}
        defaultLanguage="typescript"
        theme="vs-dark"
        onMount={handleEditorDidMountWithStore}
      />
    </VStack>
  );
};

export default TypeScriptEditor;
