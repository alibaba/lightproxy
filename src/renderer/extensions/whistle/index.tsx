import { Extension } from '../../extension';
import logger from 'electron-log';
import React, { useEffect, useRef, useState } from 'react';
import { Icon, Dropdown, Menu, message } from 'antd';
import { lazyParseData, getWhistlePort } from '../../utils';
import { Modal, Button } from 'antd';
const confirm = Modal.confirm;

import { throttle, get, debounce } from 'lodash';

import { useTranslation } from 'react-i18next';
import { syncRuleToWhistle } from '../rule-editor/components/rule-list/remote';
import { CoreAPI } from '../../core-api';

import { remote, dialog, net } from 'electron';
import { SYSTEM_IS_MACOS } from '../../../renderer/const';
import { getHelperMenus } from './helper-menus';

import { nanoid } from 'nanoid';

let mHasWarned = false;

const globalShortcut = remote.globalShortcut;

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

let notifiction: Notification;

function showNotification(title: string, content: string) {
    if (notifiction) {
        notifiction.close();
    }
    notifiction = new Notification(title, {
        body: content,
    });
}

const toggleSystemProxy = async (onlineStatus: string, port: number, coreAPI: any) => {
    console.log('toggle proxy', { onlineStatus, port });
    if (onlineStatus === 'online') {
        await enableSystemProxy(port);
        showNotification('LightProxy enabled', 'LightProxy enabled');
    } else if (onlineStatus === 'ready') {
        await diableSystemProxy();
        showNotification('LightProxy disabled', 'LightProxy disabled');
    }
    coreAPI.store.set('onlineStatus', onlineStatus);
};

export class WhistleExntension extends Extension {
    private mDevtoolPort: null | number = null;
    private mPid: null | number = null;

    private get mUserName() {
        return remote.getGlobal('WHISTLE_USERNAME');
    }

    private get mPassword() {
        return remote.getGlobal('WHISTLE_PASSWORD');
    }
    private mVisiableOnLan = false;

    async toggleSystemProxy() {
        const onlineStatus = this.coreAPI.store.get('onlineStatus');
        const port = await getWhistlePort(this.coreAPI);

        // onlineStatus in store is not really current status, just resverse it
        toggleSystemProxy(onlineStatus === 'online' ? 'ready' : 'online', port, this.coreAPI);
    }

    initGlobalKey() {
        const enableHotkeys = CoreAPI.store.get('settings')?.enableHotkeys;
        const key = `CommandOrControl+Shift+Alt+l`;
        if (enableHotkeys) {
            globalShortcut.register(key, () => {
                this.toggleSystemProxy();
            });
        } else {
            globalShortcut.unregister(key);
        }
    }

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
                    // online mean whistle ready & system proxy setting
                    // ready mean whistle ready & system proxy not setting
                    const onlineStatus = this.coreAPI.store.get('onlineStatus', 'online');

                    onlineStatus === 'online' && toggleSystemProxy(onlineStatus, port, this.coreAPI);

                    this.coreAPI.eventEmmitter.on('lightproxy-toggle-system-proxy', async () => {
                        this.toggleSystemProxy();
                    });
                }
            };

            setTimeout(() => {
                this.initGlobalKey();
            });
            CoreAPI.eventEmmitter.on('lightproxy-settings-changed', ({ changedValues }) => {
                if ('enableHotkeys' in changedValues) {
                    this.initGlobalKey();
                }
                if ('disableTlsCheck' in changedValues || 'enableGzip' in changedValues) {
                    this.startWhistle();
                }
            });

            client.onerror = err => {
                logger.error(err);
            };
            logger.info('client', client);

            await this.coreAPI.checkInstall();

            await this.startWhistle();
        })();

        this.coreAPI.eventEmmitter.on('lightproxy-restart-proxy-with-lan', () => {
            this.mVisiableOnLan = true;
            this.startWhistle(true);

            // 12 hour auto close
            setTimeout(() => {
                this.mVisiableOnLan = false;
                this.startWhistle(false);
            }, 3000 * 60 * 60);
        });
    }

    private showUserNamePassword() {
        Modal.info({
            title: 'Whistle password',
            content: (
                <div>
                    <div>
                        UserName:
                        <span style={{ userSelect: 'all', marginLeft: '5px' }}>{this.mUserName}</span>
                    </div>
                    <div>
                        Password:
                        <span style={{ userSelect: 'all', marginLeft: '5px' }}>{this.mPassword}</span>
                    </div>
                </div>
            ),
        });
    }

    /**
     *
     * @param visiableOnLan 在局域网是否可见
     */
    private async startWhistle(visiableOnLan = this.mVisiableOnLan) {
        if (this.mPid) {
            await this.coreAPI.treeKillProcess(this.mPid);
            this.mPid = null;
        }

        const settings = this.coreAPI.store.get('settings') || {};
        const defaultPort = get(settings, 'defaultPort', 12888);

        const enableGzip = get(settings, 'enableGzip', false);

        let disableTlsCheck = this.coreAPI.store.get('settings')?.disableTlsCheck;
        if (disableTlsCheck !== false) {
            disableTlsCheck = true;
        }

        const options = {
            // LIGHTPROXY_DEVTOOLS_PORT: '' + this.mDevtoolPort,
            DEFAULT_PORT: defaultPort,
            WHISTLE_HOST: visiableOnLan ? '0.0.0.0' : '127.0.0.1',
            WHISTLE_USERNAME: this.mUserName,
            WHISTLE_PASSWORD: this.mPassword,
            WHISTLE_DISABLE_TLS_CHECK: disableTlsCheck ? '1' : '0',
            WHISTLE_ENABLE_GZIP: enableGzip ? '1' : '0',
        };
        logger.info('start whistle with opts', options);
        this.mPid = await this.coreAPI.spawnModule('whistle-start', true, options);
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

            useEffect(() => {
                remote.powerMonitor.on('resume', () => {
                    logger.info('Restart whistle bacause resume');
                    this.startWhistle();
                });

                setInterval(() => {
                    logger.info('Restart whistle bacause 12hour');
                    this.startWhistle();
                    // restart every 12 hour to reduce memory leak
                }, 12 * 60 * 60 * 1000);
            }, []);

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
                    if (onlineStateRef.current === 'ready' && !mHasWarned) {
                        try {
                            const proxyworking = await this.coreAPI.checkSystemProxy(
                                '127.0.0.1',
                                (portRef.current as unknown) as number,
                            );
                            // maybe something has changed after the async call, recheck
                            if (!proxyworking && onlineStateRef.current === 'ready' && !mHasWarned) {
                                mHasWarned = true;
                                remote.getCurrentWindow().show();
                                showReEnableProxyModal();
                            }
                        } catch (e) {
                            console.log(e);
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
                    <Menu.Item onClick={this.toggleSystemProxy.bind(this)}>
                        <Icon type="desktop" />
                        {onlineState === 'ready' ? t('Disable system proxy') : t('Enable system proxy')}
                    </Menu.Item>
                    <Menu.Item onClick={() => this.startWhistle()}>
                        <Icon type="retweet"></Icon>
                        {t('Restart proxy')}
                    </Menu.Item>
                    {getHelperMenus(t)}
                    <Menu.Item onClick={this.showUserNamePassword.bind(this)}>
                        <Icon type="key" />
                        {t('Whistle password')}
                    </Menu.Item>
                </Menu>
            );

            // @ts-ignore
            const info = {
                init: {
                    title: 'Proxy starting',
                    proxyIcon: 'loading',
                    proxyClassName: 'color-warn',
                    systemProxyIcon: 'warning',
                    systemProxyClassName: 'color-warn',
                },
                online: {
                    title: 'Online but not system proxy',
                    proxyIcon: 'check-circle',
                    proxyClassName: 'color-success',
                    systemProxyIcon: 'warning',
                    systemProxyClassName: 'color-warn',
                },
                ready: {
                    title: 'Online & system proxy ready',
                    proxyIcon: 'check-circle',
                    proxyClassName: 'color-success',
                    systemProxyIcon: 'check-circle',
                    systemProxyClassName: 'color-success',
                },
                error: {
                    title: 'Error',
                    proxyIcon: 'error',
                    systemProxyIcon: 'error',
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
                <>
                    <Dropdown overlay={menu}>
                        <div className="whistle-status-bar-item">
                            {t('Proxy')}
                            {port ? `: [HTTP ${port}/SOCKS5 ${((port as unknown) as number) + 1}]` : null}{' '}
                            <Icon
                                style={{ marginRight: '10px', marginLeft: '5px' }}
                                className={info.proxyClassName}
                                type={info.proxyIcon}
                            />
                            {t('System Proxy')}
                            <Icon
                                style={{ marginLeft: '5px' }}
                                className={info.systemProxyClassName}
                                type={info.systemProxyIcon}
                            />
                            <Icon style={{ marginLeft: '10px' }} type="menu" />
                        </div>
                    </Dropdown>
                </>
            );
        };

        return WhistleStatusbarItem;
    }
}
