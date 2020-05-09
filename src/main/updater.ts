import Store from 'electron-store';
import { sendMessageToWindow } from './utils';
import logger from 'electron-log';
import { autoUpdater } from 'electron-updater';
import {
    app,
} from 'electron';

let updaterInited = false;

function initUpdater() {
    if (updaterInited) {
        return;
    }
    updaterInited = true;

    autoUpdater.logger = logger;

    // updater.on('update-downloading', () => {
    //     // auto update conditions
    //     sendMessageToWindow('updater-info', {
    //         message: 'downloading',
    //     });
    // });

    // updater.on('update-downloaded', () => {
    //     sendMessageToWindow('updater-info', {
    //         message: 'downloaded',
    //     });
    // });

    // updater.on('error', (err: any) => {
    //     logger.error(err);
    //     sendMessageToWindow('updater-info', {
    //         message: 'error',
    //     });
    // });
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

        autoUpdater.channel = 'beta';
        autoUpdater.setFeedURL({
            url: 'https://release.lightproxy.org/release',
            provider: 'generic',
        });

        initUpdater();
        Object.defineProperty(app, 'isPackaged', {
            get() {
                return true;
            }
        });
        autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
        logger.error(e);
        throw e;
    }
}
