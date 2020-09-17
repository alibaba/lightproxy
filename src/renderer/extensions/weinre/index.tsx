import React, { useState, useEffect } from 'react';
import { CoreAPI } from '../../core-api';
import { Extension } from '../../extension';
import { getWhistlePort } from '../../utils';
export class Weinre extends Extension {
    constructor() {
        super('weinre');
    }

    panelIcon() {
        return 'bug';
    }

    panelTitle() {
        return 'Debugger';
    }

    panelComponent() {
        const DebuggerPanelComp = () => {
            const [port, setPort] = useState(null as null | number);

            useEffect(() => {
                (async () => {
                    const port = await getWhistlePort(this.coreAPI);
                    setPort(port);
                })();
            }, []);

            useEffect(() => {
                CoreAPI.eventEmmitter.emit('weinre-enter');
                return function() {
                    CoreAPI.eventEmmitter.emit('weinre-exit');
                };
            }, []);

            function changeIframeStyle() {
                const iframeDocumentHead = document.querySelector('iframe')?.contentDocument?.querySelector('head');
                if (iframeDocumentHead) {
                    const customStyle = document.createElement('style');
                    customStyle.textContent = `#toolbar {
                        background: #f5f5f5;
                        border: none;
                    }
                    @media (prefers-color-scheme: dark) {
                        #toolbar {
                            background: #3b3b3d;
                        }
                        .toolbar-label {
                            color: white;
                        }
                    }
                    `;
                    iframeDocumentHead.appendChild(customStyle);
                }
            }

            return (
                <div className="lightproxy-network-panel no-drag">
                    {port ? (
                        <iframe
                            src={`http://127.0.0.1:${port}/weinre/client/#*`}
                            className="lightproxy-network-iframe"
                            onLoad={changeIframeStyle}
                        ></iframe>
                    ) : (
                        <div className="lightproxy-tip">代理未启动</div>
                    )}
                </div>
            );
        };

        return DebuggerPanelComp;
    }
}
