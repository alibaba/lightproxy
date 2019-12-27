// platform specific code

import os from 'os';
import { app } from 'electron';
import { execSync } from 'child_process';
import { PROXY_CONF_HELPER_PATH } from './const';
import logger from 'electron-log';
import globalProxy from 'global-proxy';

const systemType = os.type();
const SYSTEM_IS_MACOS = systemType === 'Darwin';

export function hideIconInDock() {
    if (SYSTEM_IS_MACOS) {
        app.hide();
        app.dock.hide();
    }
}

export async function setSystemProxy(port: number) {
    logger.info('try to set system proxy', PROXY_CONF_HELPER_PATH);
    if (port === 0) {
        if (SYSTEM_IS_MACOS) {
            execSync(`'${PROXY_CONF_HELPER_PATH}' -m off`);
        } else {
            globalProxy
                .enable('127.0.0.1', 9000, 'http')
                .then(stdout => {
                    console.log(stdout);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        return;
    }
    if (SYSTEM_IS_MACOS) {
        const output = execSync(`'${PROXY_CONF_HELPER_PATH}' -m global -p ${port} -r ${port} -s 127.0.0.1`);
        logger.info('stdout', output.toString());
    } else {
        globalProxy
            .enable('127.0.0.1', port, 'http')
            .then(stdout => {
                console.log(stdout);
            })
            .catch(error => {
                console.log(error);
            });
    }
}

export async function hideOrQuit() {
    if (SYSTEM_IS_MACOS) {
        app.hide();
    } else {
        app.quit();
    }
}
