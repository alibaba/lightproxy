import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import classnames from 'classnames';
import { Editor } from '../editor';
import { Button, Icon, Popover, message, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { uuidv4 } from '../../../../utils';

import { throttle } from 'lodash';

import { remote } from 'electron';
import monaco from '@timkendrick/monaco-editor/dist/external';

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

export const RuleList = (props: Props) => {
    const { readRules, saveRules } = props;

    const { t } = useTranslation();

    const defaultRuleList = [
        {
            name: 'Default',
            enabled: true,
            uuid: 'Default',
            content: `# LightProxy Default Rules, 输入 / 插入规则
# ${t('Default rule to keep some daily-software works behind proxy')}
# 在此输入规则
# command+s 保存
# 双击启用或者禁用规则

# hosts 绑定
# 10.101.73.189  g.alicdn.com
# 140.205.215.168  i.alicdn.com b.alicdn.com  u.alicdn.com

# 直接转发网页
# https://www.google.com https://www.alibaba.com

# 转发到文件
# https://www.google.com file:///User/xxx/xxx.html

# 匹配通配符
# ^https://*.xxx.com file:///User/xxx/xxx.html

# 更多使用方案参照文档

disable://intercept alilang-desktop-client.cn-hangzhou.log.aliyuncs.com s-api.alibaba-inc.com alilang.alibaba-inc.com auth-alilang.alibaba-inc.com mdm-alilang.alibaba-inc.com

# Apple
disable://intercept *.apple.com *.*.apple.com *.mzstatic.com *.live.com

`,
        },
    ];

    const [ruleList, setRuleList] = useState(() => readRules() || defaultRuleList);

    const [selected, setSelected] = useState(0);

    const [renameText, setRenameText] = useState('');

    const editorRef = useRef(null as null | monaco.editor.IStandaloneCodeEditor);

    const rule = ruleList[selected];

    const switchRule = (index: number) => {
        setSelected(index);
        editorRef.current?.setScrollPosition({ scrollTop: 0 });
        editorRef.current?.setPosition({ column: 1, lineNumber: 1 });
        requestAnimationFrame(() => {
            editorRef.current?.setPosition({ column: 1, lineNumber: editorRef.current?.getModel().getLineCount() });
        });
    };

    const saveWithLimit = useCallback(
        throttle((rules: Rule[]) => {
            saveRules(rules);
        }),
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
        message.success(t('Saved'));
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

                                            const handleDoubleClick = () => {
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
                                                            setRuleList(
                                                                ruleList.filter(_item => _item.uuid !== item.uuid),
                                                            );
                                                            switchRule(0);
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
                                                                name: renameText,
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
                                                    onDoubleClick={handleDoubleClick}
                                                >
                                                    {item.rename ? (
                                                        <Input
                                                            onBlur={renameComplete}
                                                            onPressEnter={renameComplete}
                                                            value={renameText}
                                                            onChange={e => setRenameText(e.target.value)}
                                                            autoFocus
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
                    content={rule.content}
                />
            ) : null}
        </div>
    );
};
