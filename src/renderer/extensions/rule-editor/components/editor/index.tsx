import React, { useState, useRef, useEffect, useContext } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { initRuleLanguage } from './rule-language/rule';
import { useTranslation } from 'react-i18next';
import { Card, Option } from '../card';

import { useThemeMode } from '../../../../hooks/use-theme-mode';
import * as monaco from 'monaco-editor';
import { useKeepAliveEffect } from 'react-keep-alive';
import { remote } from 'electron';

interface Props {
    content: string;
    onChange: (val: string) => void;
    onSave: () => void;
    onMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
    enabled: boolean;
}

initRuleLanguage(monaco);

export const Editor = (props: Props) => {
    const { content, onChange, onSave, onMount, enabled } = props;
    const { isDarkMode } = useThemeMode();
    const [showCardsPos, setShowCardsPos] = useState({ x: -1, y: -1 });
    const { t } = useTranslation();
    const editorRef = useRef(null as MonacoEditor | null);
    const onSaveRef = useRef(onSave);
    onSaveRef.current = onSave;

    useEffect(() => {
        const resizeEditor = () => {
            editorRef.current?.editor?.layout();
        };
        window.addEventListener('resize', resizeEditor);

        return function cleanup() {
            window.removeEventListener('resize', resizeEditor);
        };
    }, []);

    const handleChange = (val: string) => {
        onChange(val);
        if (editorRef.current) {
            const editor = editorRef.current.editor;

            const model = editor?.getModel();
            const position = editor?.getPosition();
            if (model && position) {
                const lineContent = model.getLineContent(position.lineNumber);
                if (lineContent.replace(/^\s+/, '').replace(/\s+$/, '') === '/') {
                    // trigger / cards

                    const top = editor?.getTopForPosition(position.lineNumber, position.column) || 0;
                    const offset = editor?.getScrollTop() || 0;
                    setShowCardsPos({ x: 205, y: top - offset + 20 });
                }
            }
        }
    };

    const handleFinished = (option: Option) => {
        setShowCardsPos({ x: -1, y: -1 });

        // insert snippet
        const editor = editorRef.current?.editor;

        if (editor) {
            const contribution = editor.getContribution('snippetController2');

            requestAnimationFrame(() => {
                editor.focus();
                const pos = editor.getPosition();
                if (pos) {
                    editor.executeEdits('', [
                        {
                            range: new monaco.Range(pos.lineNumber, pos.column - 1, pos.lineNumber, pos.column),
                            text: '',
                        },
                    ]);
                }
                // @ts-ignore
                contribution.insert(option.content);
            });
        }
    };

    const handleCancel = () => {
        setShowCardsPos({ x: -1, y: -1 });
        const editor = editorRef.current?.editor;
        editor?.focus();
    };

    useKeepAliveEffect(() => {
        window.dispatchEvent(new Event('resize'));
    });

    return (
        <div className="lightproxy-rule-editor-container">
            <div
                onDoubleClick={() => remote.getCurrentWindow().maximize()}
                className="lightproxy-editor-actionbar drag"
            >
                <span className="tip">{t('Type / to insert rule')}</span>
            </div>

            <div className="lightproxy-code-editor-container no-drag">
                {!enabled ? (
                    <div className="disabled-tip">{t('This rule is disabled, double click rule name to enable')}</div>
                ) : null}

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
                            onSaveRef?.current();
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
                {showCardsPos.x > 0 ? (
                    <Card x={showCardsPos.x} y={showCardsPos.y} onCancel={handleCancel} onFinish={handleFinished} />
                ) : null}
            </div>
        </div>
    );
};
