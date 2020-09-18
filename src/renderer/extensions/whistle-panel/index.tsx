import React, { useState, useEffect, useRef } from 'react';
import { Extension } from '../../extension';
import { getWhistlePort } from '../../utils';

const whistleIframe = document.createElement('iframe');
whistleIframe.style.display = 'none';
document.body.appendChild(whistleIframe);

export class WhistlePanel extends Extension {
    constructor() {
        super('network');
    }

    panelIcon() {
        return 'global';
    }

    panelTitle() {
        return 'Whistle';
    }

    keepAlive() {
        return false;
    }

    panelComponent() {
        const WhistlePanelComp = () => {
            const [port, setPort] = useState(null as null | number);

            useEffect(() => {
                (async () => {
                    const port = await getWhistlePort(this.coreAPI);
                    setPort(port);
                })();
            }, []);

            function changeIframeStyle() {
                const iframeDocumentHead = document.querySelector('iframe')?.contentDocument?.querySelector('head');
                if (iframeDocumentHead) {
                    const customStyle = document.createElement('style');
                    customStyle.textContent = `#container { min-width: auto; }`;
                    iframeDocumentHead.appendChild(customStyle);
                }
            }

            useEffect(() => {
                if (port) {
                    const src = `http://127.0.0.1:${port}/#network`;
                    if (whistleIframe.src !== src) {
                        whistleIframe.onload = changeIframeStyle;
                        whistleIframe.classList.add('lightproxy-network-iframe');
                        whistleIframe.style.display = 'block';
                        whistleIframe.src = src;
                    }
                }
            }, [port]);

            useEffect(() => {
                if (whistleIframe.src.indexOf('network') !== -1) {
                    whistleIframe.style.display = 'block';
                }
                return function() {
                    whistleIframe.style.display = 'none';
                };
            }, []);

            return (
                <div className="lightproxy-network-panel no-drag">
                    {port ? <></> : <div className="lightproxy-tip">代理未启动</div>}
                </div>
            );
        };

        return WhistlePanelComp;
    }
}
