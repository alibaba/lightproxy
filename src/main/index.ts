import logger from 'electron-log';
import { LIGHTPROXY_UPDATE_CONFIG, LIGHTPROXY_UPDATE_DIR, APP_VERSION, IS_BUILD_FOR_PR } from './const';
import fs from 'fs-extra-promise';
import md5file from 'md5-file';
import isDev from 'electron-is-dev';
import cp from 'child_process';
import * as Sentry from '@sentry/node';
import os from 'os';
import { checkUpdateFreash } from './updater';
import { app } from 'electron';
// electron multiple process

process.on('unhandledRejection', error => {
    logger.info(error);
    Sentry.captureException(error);
});
process.on('uncaughtException', err => {
    console.log(err);
    Sentry.captureException(err);
});

logger.info('env', process.env.ELECTRON_RUN_MODULE);
Sentry.init({ dsn: 'https://89c6a10a0db64fbca0f5d0c0c02b6902@sentry.io/1866159' });

Sentry.configureScope(scope => {
    scope.setTag('app-version', APP_VERSION);
    scope.setTag('os', os.type());
    scope.setTag('os-version', os.release());
    scope.setTag('electron-version', process.versions.electron);
    // scope.clear();
});

const originSpwan = cp.spawn;

// @ts-ignore
cp.spawn = function(cmd: string, argv: string[], options: any) {
    if (cmd === 'node' || cmd === 'node.exe') {
        cmd = process.execPath;
        options = options || {};
        options.env = options.env || {};
        options.env.ELECTRON_RUN_AS_NODE = '1';
    }

    return originSpwan.call(this, cmd, argv, options);
};

// @ts-ignore
// don't need recheck if is already loaded from external asar
if (fs.existsSync(LIGHTPROXY_UPDATE_CONFIG) && !global.isInUpdateAsar && !isDev && !IS_BUILD_FOR_PR) {
    const info = JSON.parse(fs.readFileSync(LIGHTPROXY_UPDATE_CONFIG, 'utf-8'));
    const { md5, path } = info;

    logger.info('start from asar', info);

    if (fs.existsSync(path)) {
        // to check asar md5, https://github.com/electron/electron/issues/1658
        process.noAsar = true;
        if (md5file.sync(path) === md5 && checkUpdateFreash()) {
            logger.info('md5 pass', info);
            process.noAsar = false;
            // @ts-ignore
            global.isInUpdateAsar = true;

            process.env.NODE_PATH = `${path}/node_modules:` + process.env.NODE_PATH;

            console.log(process.env.NODE_PATH);

            const realRequire = eval('require');
            realRequire(`${path}/main`);
        } else {
            // check-failed, remove
            fs.removeSync(LIGHTPROXY_UPDATE_DIR);
            // restart app
            app.relaunch();
            app.quit();
        }
    }
} else {
    require('./switch-entry');
}
