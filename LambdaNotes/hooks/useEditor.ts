import { OnMount } from '@monaco-editor/react';
import { atom, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { editor as monacoEditor } from 'monaco-editor';
import { useCallback } from 'react';
import { Lambda } from '../state/atoms';

// Atom to store the current editor instance
export const editorAtom = atom<monacoEditor.IStandaloneCodeEditor | null>(null);

export const useEditorInstance = (handleEditorDidMount: OnMount) => {
  const setEditor = useSetAtom(editorAtom);

  const handleEditorDidMountWithStore = useCallback(
    (editor, monaco) => {
      handleEditorDidMount(editor, monaco);
      setEditor(editor);
    },
    [handleEditorDidMount, setEditor]
  );

  return handleEditorDidMountWithStore;
};

// Atom to store the current editor model
export const editorModelAtom = atom<monacoEditor.IModel | null>((get) => {
  const editor = get(editorAtom);
  return editor?.getModel();
});

// Atom family to calculate decorations based on notesRoot
export const decorationsAtomFamily = atomFamily((notesRoot: Lambda) =>
  atom((get) => {
    const monaco = get(monacoInstanceAtom);
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

    return decorations;
  })
);

// Atom to calculate the flattened description text
export const descriptionLambasAsTextAtom = atom((get) => {
  const notesRoot = get(NoteViewAtomFamily);
  return notesRoot.description.reduce((acc, curr) => {
    return acc ? `${acc}\n\n${curr.value}` : curr.value;
  }, '');
});
