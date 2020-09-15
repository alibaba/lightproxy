import { useThemeMode } from '../../hooks/use-theme-mode';
import MonacoEditor from 'react-monaco-editor';
import { useRef } from 'react';
import * as monaco from 'monaco-editor';
import React from 'react';

interface EditorProps {
  content: string;
  handleChange: (val: string) => void;
  onSave: () => void;
  onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

export const Editor = (props: EditorProps) => {
  const { content, handleChange, onSave, onMount } = props;
  const editorRef: React.Ref<MonacoEditor> = useRef(null);
  const { isDarkMode } = useThemeMode();

  return (
    <MonacoEditor
      ref={editorRef}
      language="rule"
      theme={isDarkMode ? 'vs-dark' : 'vs-light'}
      value={content}
      options={{
        selectOnLineNumbers: true,
        wordWrap: 'on',
      }}
      onChange={handleChange}
      editorDidMount={(editor, monaco) => {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
          onSave();
        });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_F, () => {
          editor.getAction('actions.find').run();

          // dirty fix for #194
          // I have no idea why search input dose not get focus at first time
          setTimeout(() => {
            editor.getAction('actions.find').run();
          }, 50);
        });
        onMount(editor);
      }}
    />
  );
};
