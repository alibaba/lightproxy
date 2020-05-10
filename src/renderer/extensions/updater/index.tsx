import { Button } from 'antd';
import { Extension } from '../../extension';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron-better-ipc';
import { useTranslation } from 'react-i18next';
import { remote } from 'electron';

let tipedForUpdate = false;

export class UpdaterExntension extends Extension {
    constructor() {
        super('updater');
    }

    statusbarRightComponent() {
        return function UpdateInfo() {
            const [message, setMessage] = useState('');

            const [t] = useTranslation();

            ipcRenderer.on('updater-info', (sender, info) => {
                const message = info.message as 'downloaded' | 'downloading' | 'error';
                setMessage(message);

                if (message === 'error' && info.stack && !tipedForUpdate) {
                    tipedForUpdate = true;
                    remote.dialog.showMessageBox({
                        message: t('New version released, go to update?'),
                        buttons: [
                            t('Cancel'),
                            t('Ok'),
                        ]
                    }).then(res => {
                        if (res.response === 1) {
                            remote.shell.openExternal('https://release.lightproxy.org/leatest');
                        }
                    });
                }
            });

            const handleUpdate = () => {
                remote.require('electron-updater').autoUpdater.quitAndInstall();
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
