import React, { useEffect, useState } from 'react';
import { editor as monacoEditor } from 'monaco-editor';

import { useMonaco } from '@monaco-editor/react';
import { Lambda } from './state';

const EditorLambda: React.FC<{
  lambda: Lambda;
  editorRef: React.MutableRefObject<monacoEditor.IStandaloneCodeEditor | undefined>;
  editorMounted: boolean;
  updateLambdaValue: (arg: { lambdaId: string; newValue: string }) => void;
}> = ({ lambda, editorRef, editorMounted, updateLambdaValue }) => {
  const [decorationId, setDecorationId] = useState('');

  const monaco = useMonaco();

  useEffect(() => {
    if (!editorMounted || !editorRef.current || !monaco) {
      // Output to the console exactly which condition is causing this useEffect to be skipped
      if (!editorMounted) {
        console.log('Skipping useEffect because editorMounted is false');
        return;
      }

      if (!editorRef.current) {
        console.log('Skipping useEffect because editorRef.current is false');
        return;
      }

      if (!monaco) {
        console.log('Skipping useEffect because monaco is false');
        return;
      }
      return;
    }

    console.log('Entering the first (decoration) useEffect for EditorLambda listener', lambda.value, {
      lambda,
      decorationId,
      editorMounted,
    });

    const editor = editorRef.current;
    const model = editor.getModel();

    const startLineNumber = 1; /* calculate start line number based on lambda.position */
    const endLineNumber = startLineNumber;
    const startColumn = 1;
    const endColumn = lambda.value.length + 1;

    const decoration = {
      range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn),
      options: {
        isWholeLine: false,
        className: 'myMarker',
        hoverMessage: { value: `Lambda ID: ${lambda.id}` },
      },
    };

    if (model) {
      // Remove old decoration
      if (decorationId) {
        model.deltaDecorations([decorationId], []);
      }

      // Add new decoration and store the id
      const [id] = model.deltaDecorations([], [decoration]);
      setDecorationId(id);
    }
  }, [lambda, monaco, decorationId, editorRef, editorMounted]);

  useEffect(() => {
    if (!editorMounted || !editorRef.current || !monaco || !decorationId) {
      // Output to the console exactly which condition is causing this useEffect to be skipped
      if (!editorMounted) {
        console.log('Skipping useEffect because editorMounted is false');
        return;
      }

      if (!editorRef.current) {
        console.log('Skipping useEffect because editorRef.current is false');
        return;
      }

      if (!monaco) {
        console.log('Skipping useEffect because monaco is false');
        return;
      }

      if (!decorationId) {
        console.log('Skipping useEffect because decorationId is false');
        return;
      }
      return;
    }
    console.log('Entering second (change) the useEffect for EditorLambda listener', lambda.value, {
      lambda,
      decorationId,
      editorMounted,
    });

    const editor = editorRef.current;
    const model = editor.getModel();

    const listener = editor.onDidChangeModelContent((e: monacoEditor.IModelContentChangedEvent) => {
      e.changes.forEach((change: monacoEditor.IModelContentChange) => {
        const decorationRange = model?.getDecorationRange(decorationId);
        if (!decorationRange) {
          return;
        }

        if (decorationRange.intersectRanges(change.range)) {
          const updatedText = model?.getValueInRange(decorationRange);
          if (!updatedText) {
            return;
          }

          updateLambdaValue({ lambdaId: lambda.id, newValue: updatedText });
        }
      });
    });

    return () => listener.dispose();
  }, [monaco, updateLambdaValue, decorationId, editorMounted]);

  return null;
};

// In the parent component:
// {notesRoot.descriptions.map(lambda => <EditorLambda key={lambda.id} lambda={lambda} editorRef={editorRef} monaco={monaco} updateLambdaValue={updateLambdaValue} />)}

export default EditorLambda;
