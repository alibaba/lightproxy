import Store from 'electron-store';
import { sendMessageToWindow } from './utils';
import logger from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { app } from 'electron';
import { SYSTEM_IS_MACOS } from './const';

let updaterInited = false;

function initUpdater() {
    if (updaterInited) {
        return;
    }
    updaterInited = true;

    autoUpdater.logger = logger;

    autoUpdater.on('download-progress', (progress: any) => {
        // auto update conditions
        sendMessageToWindow('updater-info', {
            message: 'downloading',
            percent: progress.percent,
        });
    });
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-downloaded', () => {
        sendMessageToWindow('updater-info', {
            message: 'downloaded',
        });
    });

    autoUpdater.on('error', (err: any) => {
        logger.error(err);
        sendMessageToWindow('updater-info', {
            message: 'error',
            stack: err.stack,
        });
    });
}

export async function checkUpdater() {
    let updateChannel = 'stable';

    try {
        const store = new Store();
        const settings = store.get('settings') || {};
        updateChannel = settings.updateChannel || 'stable';
        updateChannel = updateChannel === 'stable' ? 'latest' : 'beta';
    } catch (e) {}

    try {
        // const url =
        //     updateChannel === 'stable'
        //         ? 'https://gw.alipayobjects.com/os/LightProxy/simple-updater-release.json'
        //         : 'https://gw.alipayobjects.com/os/LightProxy/simple-updater-beta-release.json';

        autoUpdater.channel = updateChannel === 'stable' ? 'latest' : 'beta';
        autoUpdater.setFeedURL({
            url: `https://release.lightproxy.org/release/${SYSTEM_IS_MACOS ? 'mac' : 'windows'}`,
            provider: 'generic',
        });

        initUpdater();
        Object.defineProperty(app, 'isPackaged', {
            get() {
                return true;
            },
        });
        autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
        logger.error(e);
        throw e;
    }
}
