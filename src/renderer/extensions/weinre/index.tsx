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
                    customStyle.textContent = `.content-header {
                        background: #f5f5f5;
                        border: none;
                    }
                    
                    `;
                    iframeDocumentHead.appendChild(customStyle);

                    const container = document.querySelector('iframe')?.contentDocument?.querySelector('.description');
                    if (container) {
                        container.innerHTML = `<div>
                            通过代理访问带有 lightproxy=true 参数的页面开始调试
                        </div>`;
                    }
                }
            }

            return (
                <div className="lightproxy-network-panel no-drag">
                    {port ? (
                        <iframe
                            src={`http://127.0.0.1:${port}/plugin.chii-internal/`}
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
