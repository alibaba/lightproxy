import React, { useState, useEffect, useLayoutEffect } from 'react';
// @ts-ignore
import QrCode from 'qrcode.react';
import { getWhistlePort } from '../../utils';
import { Extension } from '../../extension';
import { useTranslation } from 'react-i18next';

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

            return (
                <div className="lightproxy-phoneproxy-container">
                    <div className="lightproxy-phoneproxy-qrcode">
                        <QrCode size={256} value={`http://${address}:${port}/cgi-bin/rootca`}></QrCode>
                    </div>
                    <div className="title">
                        <span>{t('Scan to install cert')}</span>
                        <a href={`http://${address}:${port}/cgi-bin/rootca`}>{t('Click to download cert')}</a>
                    </div>
                    <div className="title">
                        <span>{t('Setting WIFI proxy to')}</span>
                        <span>{` ${address}:${port}`}</span>
                    </div>
                </div>
            );
        };

        return PhoneProxy;
    }
}
