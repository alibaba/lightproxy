import React, { useState, useEffect } from 'react';
import { Extension } from '../../extension';
import { getWhistlePort } from '../../utils';
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

            return (
                <div className="lightproxy-network-panel no-drag">
                    {port ? (
                        <iframe
                            src={`http://127.0.0.1:${port}/#network`}
                            className="lightproxy-network-iframe"
                            onLoad={changeIframeStyle}
                        ></iframe>
                    ) : (
                        <div className="lightproxy-tip">代理未启动</div>
                    )}
                </div>
            );
        };

        return WhistlePanelComp;
    }
}
