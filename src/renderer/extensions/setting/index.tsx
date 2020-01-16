import { Extension } from '../../extension';
import React from 'react';
import { SettingForm } from './components/setting-form';
import { useTranslation } from 'react-i18next';
import { CoreAPI } from '../../core-api';

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
            const settings = CoreAPI.store.get('settings') || {};

            if (!settings.updateChannel) {
                settings.updateChannel = 'stable';
            }

            if (!(settings.softwareWhiteList === false)) {
                settings.softwareWhiteList = true;
            }

            if (!settings.defaultPort) {
                settings.defaultPort = 12888;
            }

            return (
                <div className="lightproxy-setting no-drag">
                    {/* <p>LightProxy poweredby Whistle & Electron</p>
                    <p>Made with love by IFE</p>
                    <p>Version {version}</p> */}
                    <SettingFormComponent t={t} settings={settings} />
                </div>
            );
        };
        return SettingPanelComponent;
    }

    panelTitle() {
        return 'Setting';
    }
}
