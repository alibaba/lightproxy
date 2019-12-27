import React, { useState, useEffect } from 'react';
import { Extension } from '../../extension';
import { getWhistlePort } from '../../utils';
export class Network extends Extension {
    constructor() {
        super('network');
    }

    panelIcon() {
        return 'global';
    }

    panelTitle() {
        return 'Network capture';
    }

    panelComponent() {
        const NetworkPanel = () => {
            const [port, setPort] = useState(null as null | number);

            useEffect(() => {
                (async () => {
                    const port = await getWhistlePort(this.coreAPI);
                    setPort(port);
                })();
            }, []);

            return (
                <div className="lightproxy-network-panel">
                    {port ? (
                        <iframe
                            src={`http://127.0.0.1:${port}/#network`}
                            className="lightproxy-network-iframe"
                        ></iframe>
                    ) : (
                        <div className="lightproxy-tip">代理未启动</div>
                    )}
                </div>
            );
        };

        return NetworkPanel;
    }
}
