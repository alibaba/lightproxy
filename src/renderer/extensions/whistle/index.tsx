import { Extension } from '../../extension';
import logger from 'electron-log';
import React, { useEffect, useRef, useState } from 'react';
import { Icon, Dropdown, Menu, message } from 'antd';
import { lazyParseData, getWhistlePort } from '../../utils';
import { Modal, Button } from 'antd';
const confirm = Modal.confirm;

import { throttle, get } from 'lodash';

import { useTranslation } from 'react-i18next';
import { syncRuleToWhistle } from '../rule-editor/components/rule-list/remote';
import { CoreAPI } from '../../core-api';

import { remote } from 'electron';
import { SYSTEM_IS_MACOS } from '../../../renderer/const';

let mHasWarned = false;

const diableSystemProxy = async () => {
    console.log('disable system proxy');
    await CoreAPI.setSystemProxy(0);
    CoreAPI.eventEmmitter.emit('whistle-online-status-change', {
        port: null,
        status: 'online',
    });
};

const enableSystemProxy = async (port: number) => {
    console.log('enable system proxy');

    mHasWarned = false;
    await CoreAPI.setSystemProxy(0);
    await CoreAPI.setSystemProxy(port);
    CoreAPI.eventEmmitter.emit('whistle-online-status-change', {
        port,
        status: 'ready',
    });
};

const toggleSystemProxy = async (onlineStatus: string, port: number, coreAPI: any) => {
    console.log('toggle proxy', { onlineStatus, port });
    if (onlineStatus === 'online') {
        await enableSystemProxy(port);
    } else if (onlineStatus === 'ready') {
        await diableSystemProxy();
    }
    coreAPI.store.set('onlineStatus', onlineStatus);
};

export class WhistleExntension extends Extension {
    private mDevtoolPort: null | number = null;
    private mPid: null | number = null;

    constructor() {
        super('whistle');

        (async () => {
            logger.info('init');
            const client = await this.coreAPI.joinBoardcast();

            client.onmessage = event => {
                const data = lazyParseData(event.data as string);

                if (data.eventName === 'whistle-ready') {
                    const { port } = data.data;

                    this.coreAPI.eventEmmitter.emit('whistle-online-status-change', {
                        port,
                        status: 'online',
                    });

                    this.coreAPI.eventEmmitter.on('whistle-save-rule', rules => {
                        syncRuleToWhistle(rules, port);
                    });

                    this.coreAPI.eventEmmitter.on('whistle-get-port', () => {
                        this.coreAPI.eventEmmitter.emit('whistle-get-port-response', port);
                    });

                    this.coreAPI.eventEmmitter.emit('whistle-get-port-response', port);

                    this.coreAPI.eventEmmitter.on('whistle-get-devtool-port', () => {
                        this.coreAPI.eventEmmitter.emit('whistle-get-devtool-port-response', this.mDevtoolPort);
                    });
                    this.coreAPI.eventEmmitter.emit('whistle-get-devtool-port-response', this.mDevtoolPort);

                    // ... ready to set system proxy
                    const onlineStatus = this.coreAPI.store.get('onlineStatus');
                    toggleSystemProxy(onlineStatus || 'online', port, this.coreAPI);

                    this.coreAPI.eventEmmitter.on('lightproxy-toggle-system-proxy', async () => {
                        const onlineStatus = this.coreAPI.store.get('onlineStatus');

                        const port = await getWhistlePort(this.coreAPI);

                        // onlineStatus in store is not really current status, just resverse it
                        toggleSystemProxy(onlineStatus === 'online' ? 'ready' : 'online', port, this.coreAPI);
                    });
                }
            };

            client.onerror = err => {
                logger.error(err);
            };
            logger.info('client', client);

            await this.coreAPI.checkInstall();

            await this.startWhistle();
        })();

        this.coreAPI.eventEmmitter.on('lightproxy-restart-proxy-with-lan', () => {
            this.startWhistle(true);

            // 1hour auto close
            setTimeout(() => {
                this.startWhistle(false);
            }, 1000 * 60 * 60);
        });
    }

    /**
     *
     * @param visiableOnLan 在局域网是否可见
     */
    private async startWhistle(visiableOnLan = false) {
        if (this.mPid) {
            await this.coreAPI.treeKillProcess(this.mPid);
            this.mPid = null;
        }
        const settings = this.coreAPI.store.get('settings') || {};
        const defaultPort = get(settings, 'defaultPort', 12888);
        this.mPid = await this.coreAPI.spawnModule('whistle-start', true, {
            // LIGHTPROXY_DEVTOOLS_PORT: '' + this.mDevtoolPort,
            DEFAULT_PORT: defaultPort,
            WHISTLE_HOST: visiableOnLan ? '0.0.0.0' : '127.0.0.1',
        });
    }

    statusbarRightComponent() {
        // @ts-ignore
        // eslint-disable-next-line react/prop-types
        const WhistleStatusbarItem = ({ setStatusBarMode }) => {
            const [onlineState, setOnlineState] = useState('init');

            const [port, setPort] = useState();

            useEffect(() => {
                const modeMap = {
                    online: 'warn',
                    ready: 'normal',
                    loading: 'warn',
                    init: 'warn',
                };
                // @ts-ignore
                setStatusBarMode(modeMap[onlineState]);
            }, [onlineState]);

            const portRef = useRef(port);
            portRef.current = port;

            const onlineStateRef = useRef(onlineState);
            onlineStateRef.current = onlineState;

            const { t } = useTranslation();

            const [hit, setHit] = useState(null as null | string);

            const hideHit = throttle(() => {
                setHit(null);
            }, 3000);

            useEffect(() => {
                let client: WebSocket;
                (async () => {
                    client = await this.coreAPI.joinBoardcast();

                    client.onmessage = event => {
                        // const data = lazyParseData(event.data as string);
                        // if (data.eventName === 'whistle-hit') {
                        //     setHit(data.data.host);
                        //     setTimeout(hideHit);
                        // }
                    };
                })();

                const handler = () => {
                    setOnlineState(this.coreAPI.store.get('onlineStatus'));
                };
                this.coreAPI.eventEmmitter.on('lightproxy-toggle-system-proxy', handler);

                const showReEnableProxyModal = () => {
                    confirm({
                        title: t('System proxy changed'),
                        content: t('System proxy changed by other Program, re-enable proxy?'),
                        onOk: () => {
                            mHasWarned = false;
                            enableSystemProxy((portRef.current as unknown) as number);
                        },
                        onCancel: () => {
                            mHasWarned = true;
                            CoreAPI.eventEmmitter.emit('whistle-online-status-change', {
                                port: null,
                                status: 'online',
                            });
                        },
                    });
                };

                const checkProxy = async () => {
                    if (!SYSTEM_IS_MACOS) {
                        return;
                    }
                    if (onlineStateRef.current === 'ready' && !mHasWarned) {
                        try {
                            const proxyworking = await this.coreAPI.checkSystemProxy(
                                '127.0.0.1',
                                (portRef.current as unknown) as number,
                            );
                            console.log('proxy check', proxyworking);
                            // maybe something has changed after the async call, recheck
                            if (!proxyworking && onlineStateRef.current === 'ready' && !mHasWarned) {
                                mHasWarned = true;
                                remote.getCurrentWindow().show();
                                showReEnableProxyModal();
                            }
                        } catch (e) {
                            // console.log(e);
                        }
                    }
                };

                const checkTimer = setInterval(checkProxy, 5000);

                return () => {
                    client?.close();
                    this.coreAPI.eventEmmitter.off('lightproxy-toggle-system-proxy', handler);
                    clearInterval(checkTimer);
                };
            }, []);

            const menu = (
                <Menu>
                    <Menu.Item
                        onClick={() =>
                            toggleSystemProxy(onlineState, (portRef.current as unknown) as number, this.coreAPI)
                        }
                    >
                        {onlineState === 'ready' ? t('disable system proxy') : t('enable system proxy')}
                    </Menu.Item>
                    <Menu.Item onClick={() => this.startWhistle()}>{t('restart proxy')}</Menu.Item>
                </Menu>
            );

            // @ts-ignore
            const info = {
                init: {
                    title: 'Proxy starting',
                    icon: 'loading',
                },
                online: {
                    title: 'Online but not system proxy',
                    icon: 'loading-3-quarters',
                },
                ready: {
                    title: 'Online & system proxy ready',
                    icon: 'check-circle',
                },
                error: {
                    title: 'Error',
                    icon: 'error',
                },
            }[onlineState];

            useEffect(() => {
                this.coreAPI.eventEmmitter.on('whistle-online-status-change', data => {
                    setOnlineState(data.status);
                    if (data.port) {
                        setPort(data.port);
                    }
                });
            }, []);
            return (
                <Dropdown overlay={menu}>
                    <div className="whistle-status-bar-item">
                        {/* {hit ? 'hit ' + hit + '  ' : null}  */}
                        {t(info.title)}
                        {port ? `: [HTTP ${port}/SOCKS5 ${((port as unknown) as number) + 1}]` : null}{' '}
                        <Icon type={info.icon} />
                    </div>
                </Dropdown>
            );
        };

        return WhistleStatusbarItem;
    }
}
