import { Extension } from '../../extension';
import React from 'react';
import { version } from '../../../../package.json';

export class Setting extends Extension {
    constructor() {
        super('setinng');
    }

    panelIcon() {
        return 'setting';
    }

    panelComponent() {
        return function SettingPanelComponent() {
            return (
                <div className="lightproxy-setting">
                    <p>LightProxy poweredby Whistle & Electron</p>
                    <p>Made with love by IFE</p>
                    <p>Version {version}</p>
                </div>
            );
        };
    }

    panelTitle() {
        return 'Setting';
    }
}
