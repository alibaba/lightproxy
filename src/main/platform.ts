// platform specific code

import os from 'os';
import { app } from 'electron';
import { execSync, exec } from 'child_process';
import { PROXY_CONF_HELPER_PATH, PROXY_REFRESH_WINDOWS_HELPER_PATH } from './const';
import logger from 'electron-log';
import globalProxy from '@xcodebuild/global-proxy';

const systemType = os.type();
const SYSTEM_IS_MACOS = systemType === 'Darwin';

export function hideIconInDock() {
    if (SYSTEM_IS_MACOS) {
        app.hide();
        app.dock.hide();
    }
}

interface ProxyInfo {
    HTTPEnable: string;
    HTTPPort: string;
    HTTPProxy: string;
    HTTPSEnable: string;
    HTTPSPort: string;
    HTTPSProxy: string;
    ProxyAutoConfigEnable: string;
    SOCKSEnable: string;
}

function covertOutputToJSON(output: string) {
    // @ts-ignore
    const content = /{[^]*?}/.exec(output.replace(/ExceptionsList.*\n.*\n.*\n/, ''))[0];
    const jsonContent = content
        .replace(/([a-zA-Z0-9\.]+)/g, '"$1"')
        .replace(/"\n/g, '",\n')
        .replace(/,.*\n?}/, '}');
    return jsonContent;
}

export async function checkSystemProxyWork(address: string, port: number) {
    return new Promise((resolve, reject) => {
        if (!SYSTEM_IS_MACOS) {
            // Windows
            const WINDOWS_QUERY_PROXY = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"`;

            const WINDOWS_PROXY_ENABLE_REGEX = /ProxyEnable\s+REG_DWORD\s+0x1/;
            const currentProxyRegex = new RegExp(`ProxyServer\\s+REG_SZ\\s+${address}:${port}`);

            exec(WINDOWS_QUERY_PROXY, (error, stdout) => {
                if (error || !stdout.length) {
                    reject(error);
                } else if (WINDOWS_PROXY_ENABLE_REGEX.test(stdout) && currentProxyRegex.test(stdout)) {
                    return resolve(true);
                }
                return resolve(false);
            });
            return;
        }
        exec('scutil --proxy', (error, stdout) => {
            const NO_NETWORK_OUTPUT = `<dictionary> {
}
`;

            function checkProxyInfo(info: ProxyInfo, portStr: string) {
                return (
                    info.HTTPEnable === '1' &&
                    info.HTTPPort === portStr &&
                    info.HTTPProxy === address &&
                    info.HTTPSEnable === '1' &&
                    info.HTTPSPort === portStr &&
                    info.HTTPSProxy === address &&
                    info.ProxyAutoConfigEnable === '0' &&
                    info.SOCKSEnable === '0'
                );
            }

            try {
                const output = stdout.toString();

                if (output === NO_NETWORK_OUTPUT) {
                    // no network, no proxy info
                    reject('no network');
                }

                // @ts-ignore
                const jsonContent = covertOutputToJSON(output);

                const info = JSON.parse(jsonContent) as ProxyInfo;
                const portStr = '' + port;

                if (checkProxyInfo(info, portStr)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (e) {
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

export async function setSystemProxy(port: number) {
    logger.info('try to set system proxy', PROXY_CONF_HELPER_PATH);
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
        const output = execSync(
            `'${PROXY_CONF_HELPER_PATH}' -m global -p ${port} -r ${port} -s 127.0.0.1 -x "*.lan, *.ali.com, *.hz.ali.com"`,
        );
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
