import { Extension } from '../../extension';
import React from 'react';
import { SettingForm } from './components/setting-form';
import { useTranslation } from 'react-i18next';

export class Setting extends Extension {
    constructor() {
        super('setinng');
    }

    panelIcon() {
        return 'setting';
    }

    panelComponent() {
        return function SettingPanelComponent() {
            const { t } = useTranslation();

            return (
                <div className="lightproxy-setting">
                    {/* <p>LightProxy poweredby Whistle & Electron</p>
                    <p>Made with love by IFE</p>
                    <p>Version {version}</p> */}
                    <SettingForm t={t} />
                </div>
            );
        };
    }

    panelTitle() {
        return 'Setting';
    }
}
