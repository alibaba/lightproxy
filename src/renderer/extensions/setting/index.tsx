import { Extension } from '../../extension';
import React, { useState, useEffect } from 'react';
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
            const loadStoreSettings = () => {
                const settings = CoreAPI.store.get('settings') || {};
                const { updateChannel = 'stable', softwareWhiteList = true, defaultPort = 12888 } = settings;
                return {
                    updateChannel,
                    softwareWhiteList,
                    defaultPort,
                };
            };
            const [settingState, setSettingState] = useState<Record<string, any>>(loadStoreSettings());

            useEffect(() => {
                const refreshStoreSettings = () => {
                    setSettingState(loadStoreSettings());
                };

                CoreAPI.eventEmmitter.on('reload-store-config', refreshStoreSettings);

                return () => {
                    CoreAPI.eventEmmitter.off('reload-store-config', refreshStoreSettings);
                };
            }, []);

            return (
                <div className="lightproxy-setting no-drag">
                    {/* <p>LightProxy poweredby Whistle & Electron</p>
                    <p>Made with love by IFE</p>
                    <p>Version {version}</p> */}
                    <SettingFormComponent t={t} settings={settingState} />
                </div>
            );
        };
        return SettingPanelComponent;
    }

    panelTitle() {
        return 'Setting';
    }
}
