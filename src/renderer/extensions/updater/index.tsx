import { Button } from 'antd';
import { Extension } from '../../extension';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron-better-ipc';
import { useTranslation } from 'react-i18next';
import { remote } from 'electron';

export class UpdaterExntension extends Extension {
    constructor() {
        super('updater');
    }

    statusbarRightComponent() {
        return function UpdateInfo() {
            const [message, setMessage] = useState('');

            const [t] = useTranslation();

            ipcRenderer.on('updater-info', (sender, info) => {
                // @ts-ignore
                setMessage(info.message);
            });

            const handleUpdate = () => {
                remote.require('electron-simple-updater').quitAndInstall();
            };

            return (
                <span>
                    {message === 'downloading' ? (
                        t('Update downloading...')
                    ) : message === 'downloaded' ? (
                        <Button
                            onClick={handleUpdate}
                            type="primary"
                            style={{ height: '100%', fontSize: '12px' }}
                            size="small"
                        >
                            {t('Update downloaded, install with restart')}
                        </Button>
                    ) : null}
                </span>
            );
        };
    }
}
