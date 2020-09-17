import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import classnames from 'classnames';
import { Editor } from '../editor';
import { Button, Icon, Popover, message, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { uuidv4 } from '../../../../utils';

import { throttle } from 'lodash';

import { remote } from 'electron';
import * as monaco from 'monaco-editor';
import { CoreAPI } from '../../../../core-api';

const { Menu, MenuItem } = remote;

export interface Rule {
    name: string;
    uuid: string;
    content: string;
    enabled: boolean;
    rename?: boolean;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}

function withNewlineAsEnd(str: string) {
    if (!/\n$/.test(str)) {
        return str + '\n';
    }
    return str;
}

interface Props {
    readRules: () => Rule[];
    saveRules: (rules: Rule[]) => void;
}

// to fix https://github.com/alibaba/lightproxy/issues/14
// save tab status here
const editorStatus = {} as {
    [index: number]:
        | {
              model: any;
              viewState: any;
          }
        | undefined;
};

let initalEditorViewState = null as any;

export const RuleList = (props: Props) => {
    const { readRules, saveRules } = props;

    const { t } = useTranslation();

    const defaultRuleList = [
        {
            name: 'Default',
            enabled: true,
            uuid: 'Default',
            content: `# LightProxy Default Rules, Input / to insert
# ${t('Default rule to keep some daily-software works behind proxy')}
# command+s to save
# Double click to enable/disable rule

# hosts bindings
# 10.101.73.189  g.alicdn.com
# 140.205.215.168  i.alicdn.com b.alicdn.com  u.alicdn.com

# mapping web page
# https://www.google.com https://www.alibaba.com

# mapping to file
# https://www.google.com file:///User/xxx/xxx.html

# mapping by wildcard
# ^https://*.example.com file:///User/xxx/xxx.html

# More usage follow document: https://alibaba.github.io/lightproxy/quick-start.html

`,
        },
    ];

    const [ruleList, setRuleList] = useState(() => readRules() || defaultRuleList);

    useEffect(() => {
        const enterHandler = () => {
            saveRules(
                ruleList.concat([
                    {
                        uuid: '[internal-debugger-on]',
                        content: `/lightproxy=true/ weinre://*`,
                        enabled: true,
                        name: '[internal-debugger-on]',
                    },
                ]),
            );
        };

        const exitHandler = () => {
            saveRules(ruleList.filter(item => item.uuid !== '[internal-debugger-on]'));
        };
        CoreAPI.eventEmmitter.on('weinre-enter', enterHandler);
        CoreAPI.eventEmmitter.on('weinre-exit', exitHandler);

        return function() {
            CoreAPI.eventEmmitter.off('weiren-enter', enterHandler);
            CoreAPI.eventEmmitter.off('weiren-exit', exitHandler);
        };
    }, [ruleList]);

    const [selected, setSelected] = useState(0);

    const [renameText, setRenameText] = useState('');

    const editorRef = useRef(null as null | monaco.editor.IStandaloneCodeEditor);

    const rule = ruleList[selected];

    const switchRule = (index: number, isRemove = false) => {
        const editor = editorRef.current;
        if (editor) {
            try {
                if (isRemove) {
                    editorStatus[selected] = undefined;
                } else {
                    editorStatus[selected] = {
                        model: editor.getModel(),
                        viewState: editor.saveViewState(),
                    };
                }
            } catch (e) {}

            if (!editorStatus[index]) {
                editorStatus[index] = {
                    model: monaco.editor.createModel(ruleList[index].content, 'rule'),
                    viewState: initalEditorViewState,
                };
            }

            try {
                editor.setModel(editorStatus[index]?.model);
            } catch (e) {
                // Model is disposed
                editorStatus[index] = {
                    model: monaco.editor.createModel(ruleList[index].content, 'rule'),
                    viewState: initalEditorViewState,
                };
                editor.setModel(editorStatus[index]?.model);
            }
            editor.restoreViewState(editorStatus[index]?.viewState);
        }

        setSelected(index);
        editorRef.current?.setScrollPosition({ scrollTop: 0 });
        editorRef.current?.setPosition({ column: 1, lineNumber: 1 });
        requestAnimationFrame(() => {
            editorRef.current?.setPosition({
                column: 1,
                lineNumber: editorRef.current?.getModel()?.getLineCount() || 0,
            });
        });
    };

    const saveWithLimit = useCallback(
        throttle((rules: Rule[]) => {
            saveRules(rules);
        }, 1000),
        [],
    );

    const onDragEnd = useMemo(() => {
        return (result: DropResult) => {
            if (!result.destination) {
                return;
            }

            const currentSelectUUID = ruleList[selected].uuid;

            const items = reorder(ruleList, result.source.index, result.destination.index);

            setRuleList(items);

            switchRule(items.findIndex(item => item.uuid === currentSelectUUID));
        };
    }, [selected, ruleList]);

    useEffect(() => {
        if (ruleList.length === 0) {
            // put default
            setRuleList(defaultRuleList);

            switchRule(0);
        }

        saveWithLimit(ruleList);
    }, [ruleList]);

    const toggleRuleEnabled = useCallback(
        (index: number) => {
            const newRules = ruleList.map((_item, _index) => {
                if (_index === index) {
                    return {
                        ..._item,
                        enabled: !_item.enabled,
                    };
                } else {
                    return _item;
                }
            });
            setRuleList(newRules);

            requestAnimationFrame(() => {
                saveRules(newRules);
                message.success(t('Switched'));
            });
        },
        [ruleList],
    );

    const toggleRuleEnabledRef = useRef(toggleRuleEnabled);
    toggleRuleEnabledRef.current = toggleRuleEnabled;

    useEffect(() => {
        if (!initalEditorViewState && editorRef.current) {
            initalEditorViewState = editorRef.current.saveViewState();
        }

        const handler = (index: number) => {
            toggleRuleEnabledRef.current(index);
        };
        CoreAPI.eventEmmitter.on('lightproxy-toggle-rule', handler);

        return () => {
            CoreAPI.eventEmmitter.off('lightproxy-toggle-rule', handler);
        };
    }, []);

    const handleEditorOnChange = (val: string) => {
        const newRuleList = ruleList.map((item, index) => {
            if (index === selected) {
                return {
                    ...item,
                    content: withNewlineAsEnd(val),
                };
            } else {
                return {
                    ...item,
                    content: withNewlineAsEnd(item.content),
                };
            }
        });
        setRuleList(newRuleList);
    };

    const handleOnSave = () => {
        saveRules(ruleList);
        message.destroy();
        if (new Date().getHours() >= 21) {
            message.success(t('Saved, good night'));
        } else {
            message.success(t('Saved'));
        }
    };

    const onEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
    };

    const handleAddRule = () => {
        const newList = ruleList.concat({
            name: 'New Rule',
            enabled: true,
            uuid: uuidv4(),
            content: `# New Rules
`,
        });

        setRuleList(newList);

        switchRule(newList.length - 1);

        saveWithLimit(newList);

        editorRef.current?.focus();
    };

    return (
        <div style={{ height: '100%' }}>
            <div className="lightproxy-rule-actionbar drag">
                <Popover content={t('New Rule')} trigger="hover">
                    <Button onClick={handleAddRule} className="no-drag lightproxy-add-rule-btn">
                        <Icon type="form" />
                    </Button>
                </Popover>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {provided => (
                        <div
                            className="lightproxy-rule-list no-drag"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {ruleList.map((item, index) => {
                                const className = classnames({
                                    'lightproxy-rule-list-item': true,
                                    selected: index === selected,
                                    enabled: !item.rename && item.enabled,
                                });
                                return (
                                    <Draggable key={item.uuid} draggableId={item.uuid} index={index}>
                                        {provided => {
                                            const handleClick = () => {
                                                switchRule(index);
                                            };

                                            const handleDoubleClick = (rename: boolean | undefined) => {
                                                if (rename) return;

                                                toggleRuleEnabledRef.current(index);
                                            };

                                            const handleContextMenu = () => {
                                                const menu = new Menu();
                                                menu.append(
                                                    new MenuItem({
                                                        label: t('rename'),
                                                        click: () => {
                                                            setRuleList(
                                                                ruleList.map((_item, _index) => {
                                                                    if (_index === index) {
                                                                        return {
                                                                            ..._item,
                                                                            rename: true,
                                                                        };
                                                                    } else {
                                                                        return _item;
                                                                    }
                                                                }),
                                                            );
                                                            setRenameText(ruleList[index].name);
                                                            switchRule(index);
                                                        },
                                                    }),
                                                );

                                                menu.append(
                                                    new MenuItem({
                                                        label: t('remove'),
                                                        click: () => {
                                                            const newRules = ruleList.filter(
                                                                _item => _item.uuid !== item.uuid,
                                                            );
                                                            setRuleList(newRules);
                                                            switchRule(0, true);
                                                        },
                                                    }),
                                                );
                                                menu.popup();
                                            };

                                            const renameComplete = () => {
                                                setRuleList(
                                                    ruleList.map((_item, _index) => {
                                                        if (index === _index) {
                                                            return {
                                                                ..._item,
                                                                name: renameText || 'New Rule',
                                                                rename: false,
                                                            };
                                                        } else {
                                                            return _item;
                                                        }
                                                    }),
                                                );
                                            };

                                            return (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={className}
                                                    onClick={handleClick}
                                                    onContextMenu={handleContextMenu}
                                                    onDoubleClick={() => handleDoubleClick(item.rename)}
                                                >
                                                    {item.rename ? (
                                                        <Input
                                                            onBlur={renameComplete}
                                                            onPressEnter={renameComplete}
                                                            value={renameText}
                                                            onChange={e => setRenameText(e.target.value)}
                                                            autoFocus
                                                            onFocus={e => {
                                                                e.persist();
                                                                setTimeout(() => e.target.select());
                                                            }}
                                                        ></Input>
                                                    ) : (
                                                        <span>{item.name}</span>
                                                    )}
                                                </div>
                                            );
                                        }}
                                    </Draggable>
                                );
                            })}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            {rule ? (
                <Editor
                    // @ts-ignore
                    onMount={onEditorMount}
                    onSave={handleOnSave}
                    onChange={handleEditorOnChange}
                    content={(rule && rule.content) || ''}
                    enabled={rule && rule.enabled}
                />
            ) : null}
        </div>
    );
};
