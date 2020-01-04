import { Extension } from '../../extension';
import React from 'react';
import { SettingForm } from './components/setting-form';
import { useTranslation } from 'react-i18next';

const SettingFormComponent = SettingForm as any;

export class Setting extends Extension {
    constructor() {
        super('setinng');
    }

    panelIcon() {
        return 'setting';
    }

    panelComponent() {
        const SettingPanelComponent = () => {
            const { t } = useTranslation();

            return (
                <div className="lightproxy-setting">
                    {/* <p>LightProxy poweredby Whistle & Electron</p>
                    <p>Made with love by IFE</p>
                    <p>Version {version}</p> */}
                    <SettingFormComponent t={t} />
                </div>
            );
        };
        return SettingPanelComponent;
    }

    panelTitle() {
        return 'Setting';
    }
}
