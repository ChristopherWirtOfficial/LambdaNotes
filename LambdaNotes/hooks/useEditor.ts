import { OnMount } from '@monaco-editor/react';
import { atom, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { editor as monacoEditor } from 'monaco-editor';
import { useCallback } from 'react';
import { Lambda } from '../state';

// TODO: PICKUP - This set of atoms and hooks is NOT in use currently, but probably should be!
/*           I'd ideally love to manage these with atoms:
 *             - editor ref
 *             - monaco instance (injected from a hook ig)
 *             - decorations/ranges
 *             - CHANGES (and updating the atoms accordingly)
 *
 *           In my ideal world, this would let each lambda be fully represented by some atom that
 *            ultimately orchestrates and encapsulates all of the above for its own state.
 *
 *           The editor/monaco instances will be singletons, and we'll also want "editorMounted" to be an atom
 *            - Maybe also a derived atom that is like `editorMounted && editorInstance && monacoInstance`
 */
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

    const decorations = notesRoot.descriptions.map((lambda, index) => {
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

// Atom to calculate the flattened descriptions text
export const descriptionsLambasAsTextAtom = atom((get) => {
  const notesRoot = get(NoteViewAtomFamily);
  return notesRoot.descriptions.reduce((acc, curr) => {
    return acc ? `${acc}\n\n${curr.value}` : curr.value;
  }, '');
});
