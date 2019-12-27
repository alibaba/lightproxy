import { Extension } from '../../extension';
import logger from 'electron-log';
import React, { useEffect, useState } from 'react';
import { Icon, Dropdown, Menu } from 'antd';
import { lazyParseData } from '../../utils';

import { throttle } from 'lodash';

import { useTranslation } from 'react-i18next';
import { syncRuleToWhistle } from '../rule-editor/components/rule-list/remote';

const toggleSystemProxy = async (onlineStatus: string, port: number, coreAPI: any) => {
    if (onlineStatus === 'online') {
        await coreAPI.setSystemProxy(port);
        coreAPI.eventEmmitter.emit('whistle-online-status-change', {
            port,
            status: 'ready',
        });
    } else if (onlineStatus === 'ready') {
        await coreAPI.setSystemProxy(0);
        coreAPI.eventEmmitter.emit('whistle-online-status-change', {
            port,
            status: 'online',
        });
    }
};

export class WhistleExntension extends Extension {
    private mStartWhistle: null | (() => Promise<void>) = null;

    private mDevtoolPort: null | number = null;

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
                    toggleSystemProxy('online', port, this.coreAPI);
                }
            };

            client.onerror = err => {
                logger.error(err);
            };
            logger.info('client', client);

            await this.coreAPI.checkInstall();

            const startWhistle = async () => {
                // this.mDevtoolPort = await this.coreAPI.getPort();
                const pid = await this.coreAPI.spawnModule('whistle-start', true, {
                    // LIGHTPROXY_DEVTOOLS_PORT: '' + this.mDevtoolPort,
                });
                this.mStartWhistle = async () => {
                    await this.coreAPI.treeKillProcess(pid);
                    await startWhistle();
                };
            };

            await startWhistle();
        })();
    }

    statusbarRightComponent() {
        const WhistleStatusbarItem = () => {
            const [onlineState, setOnlineState] = useState('init');

            const [port, setPort] = useState();

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
                        const data = lazyParseData(event.data as string);
                        if (data.eventName === 'whistle-hit') {
                            setHit(data.data.host);
                            setTimeout(hideHit);
                        }
                    };
                })();

                return function cleanup() {
                    client?.close();
                };
            }, []);

            const menu = (
                <Menu>
                    <Menu.Item onClick={() => toggleSystemProxy(onlineState, port, this.coreAPI)}>
                        {onlineState === 'ready' ? t('disable system proxy') : t('enable system proxy')}
                    </Menu.Item>
                    <Menu.Item onClick={() => this.mStartWhistle && this.mStartWhistle()}>
                        {t('restart proxy')}
                    </Menu.Item>
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
                    setPort(data.port);
                });
            }, []);
            return (
                <Dropdown overlay={menu}>
                    <div className="whistle-status-bar-item">
                        {hit ? 'hit ' + hit + '  ' : null} {t(info.title)}
                        {port ? `: ${port}` : null} <Icon type={info.icon} />
                    </div>
                </Dropdown>
            );
        };

        return WhistleStatusbarItem;
    }
}
