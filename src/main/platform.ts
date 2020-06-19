// platform specific code

import os from 'os';
import { app } from 'electron';
import { execSync, exec } from 'child_process';
import { PROXY_CONF_HELPER_PATH, PROXY_REFRESH_WINDOWS_HELPER_PATH } from './const';
import logger from 'electron-log';
import globalProxy from '@xcodebuild/global-proxy';
import Koa from 'koa';
import portfinder from 'portfinder';

const systemType = os.type();
const SYSTEM_IS_MACOS = systemType === 'Darwin';

let proxyPort = 0;
let pacServerPort = 0;

export function hideIconInDock() {
    if (SYSTEM_IS_MACOS) {
        app.hide();
        app.dock.hide();
    }
}

export async function checkSystemProxyWork(address: string, port: number) {
    return new Promise((resolve, reject) => {
        if (!SYSTEM_IS_MACOS) {
            reject();
            return;
        }
        exec('scutil --proxy', (error, stdout) => {
            const NO_NETWORK_OUTPUT = `<dictionary> {
}
`;
            try {
                const output = stdout.toString();

                if (output === NO_NETWORK_OUTPUT) {
                    // no network, no proxy info
                    reject('no network');
                }

                if (output.indexOf(`http://127.0.0.1:${pacServerPort}`) !== -1) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                logger.error(e);
                if (stdout.toString().length > 0) {
                    // has output but can not parse
                    resolve(false);
                } else {
                    reject(e);
                }
            }
        });
    });
}

async function setupPacServer() {
    if (pacServerPort === 0) {
        pacServerPort = await portfinder.getPortPromise({ port: 11100 });
        const app = new Koa();
        app.use(async ctx => {
            ctx.body = `function FindProxyForURL(url, host) {
                return "PROXY 127.0.0.1:${proxyPort}; DIRECT";
              }`;
            ctx.set('content-type', 'application/x-ns-proxy-autoconfig');
        });
        app.listen(pacServerPort);
    }
}

export async function setSystemProxy(port: number) {
    logger.info('try to set system proxy', PROXY_CONF_HELPER_PATH);
    proxyPort = port;
    setupPacServer();

    if (port === 0) {
        if (SYSTEM_IS_MACOS) {
            execSync(`'${PROXY_CONF_HELPER_PATH}' -m off`);
        } else {
            return globalProxy
                .disable()
                .then(stdout => {
                    console.log(stdout);
                    execSync(PROXY_REFRESH_WINDOWS_HELPER_PATH);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        return;
    }
    if (SYSTEM_IS_MACOS) {
        const output = execSync(`'${PROXY_CONF_HELPER_PATH}' -m auto -u http://127.0.0.1:${pacServerPort}`);
        logger.info('stdout', output.toString());
    } else {
        return globalProxy
            .enable('127.0.0.1', port, 'http')
            .then(stdout => {
                console.log(stdout);
                execSync(PROXY_REFRESH_WINDOWS_HELPER_PATH);
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
