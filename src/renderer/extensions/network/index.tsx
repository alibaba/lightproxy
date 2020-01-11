import React, { useState, useEffect } from 'react';
import { Extension } from '../../extension';
import { getWhistlePort } from '../../utils';
import { CoreAPI } from '../../core-api';

export class Network extends Extension {
    constructor() {
        super('network');
    }

    panelIcon() {
        return 'experiment';
    }

    panelTitle() {
        return 'Network capture';
    }

    panelComponent() {
        const NetworkPanel = () => {
            const [inspectorUrl, setInspectorUrl] = useState(null as null | string);
            useEffect(() => {
                (async () => {
                    const url = await this.coreAPI.getStaticServePath();
                    const port = await getWhistlePort(CoreAPI);
                    setInspectorUrl(`${url}/devtools-frontend/front_end/inspector.html?whistlePort=${port}`);
                })();
            }, []);

            return (
                <div className="lightproxy-network-panel no-drag">
                    {inspectorUrl ? (
                        <iframe src={inspectorUrl} className="lightproxy-network-iframe"></iframe>
                    ) : (
                        <div className="lightproxy-tip">代理未启动</div>
                    )}
                </div>
            );
        };

        return NetworkPanel;
    }
}
