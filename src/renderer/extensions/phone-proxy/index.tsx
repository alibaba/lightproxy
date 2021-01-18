import React, { useState, useEffect, useLayoutEffect } from 'react';
// @ts-ignore
import QrCode from 'qrcode.react';
import { getWhistlePort } from '../../utils';
import { Extension } from '../../extension';
import { useTranslation } from 'react-i18next';
import { clipboard } from 'electron';
import { message } from 'antd';

export class PhoneProxy extends Extension {
    constructor() {
        super('phone-proxy');
    }

    panelIcon() {
        return 'scan';
    }

    panelTitle() {
        return 'Phone proxy';
    }

    panelComponent() {
        const PhoneProxy = () => {
            const [port, setPort] = useState(null as null | number);
            const [address, setAddress] = useState(null as null | string);

            const { t } = useTranslation();

            useEffect(() => {
                this.coreAPI.eventEmmitter.emit('lightproxy-restart-proxy-with-lan');
                message.info(t('Visiable on LAN enabled'));
            }, []);

            useEffect(() => {
                (async () => {
                    const _port = await getWhistlePort(this.coreAPI);
                    setPort(_port);
                })();
            }, []);

            useLayoutEffect(() => {
                (async () => {
                    const _address = await this.coreAPI.getIp();
                    if (_address !== address) {
                        setAddress(_address);
                    }
                })();
            });

            function copyProxyAddress() {
                clipboard.writeText(`${address}:${port}`);
                message.success(t('WIFI proxy address has been copied to the pasteboard'));
            }

            function copyCertAddress() {
                clipboard.writeText(`http://${address}:${port}/cgi-bin/rootca`);
                message.success(t('Cert address has been copied to the pasteboard'));
            }

            return (
                <div className="lightproxy-phoneproxy-container">
                    <div className="lightproxy-phoneproxy-qrcode">
                        <QrCode size={256} value={`http://${address}:${port}/cgi-bin/rootca`}></QrCode>
                    </div>
                    <div className="title">
                        <span className="margin10">{t('Scan to install cert')}</span>
                        <a className="margin10"href={`http://${address}:${port}/cgi-bin/rootca`}>{t('Click to download cert')}</a>
                        <span className="button" onClick={copyCertAddress}>{t('Click to copy cert link')}</span>
                    </div>
                    <div className="title" onClick={copyProxyAddress}>
                        <span>{t('Setting WIFI proxy to')}</span>
                        <a>{`${address}:${port}`}</a>
                    </div>
                </div>
            );
        };

        return PhoneProxy;
    }
}
