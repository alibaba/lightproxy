/**
 * 证书安装
 * Helper 安装等
 */
//@ts-ignore
import fs from 'fs-extra-promise';
//@ts-ignore
import tempdir from 'tempdir';
import path from 'path';
//@ts-ignore
import sudo from 'sudo-prompt';
//@ts-ignore
import forge from 'node-forge';
import { execSync } from 'child_process';
import {
    CERT_KEY_FILE_NAME,
    CERT_FILE_NAME,
    LIGHTPROXY_CERT_DIR_PATH,
    LIGHTPROXY_CERT_KEY_PATH,
    SYSTEM_IS_MACOS,
    PROXY_CONF_HELPER_PATH,
    PROXY_CONF_HELPER_FILE_PATH,
} from './const';
import { dialog } from 'electron';
import treeKill from 'tree-kill';

const pki = forge.pki;

const sudoOptions = {
    name: 'LightProxy',
};

async function generateCert() {
    return new Promise(resolve => {
        const keys = pki.rsa.generateKeyPair(2048);
        const cert = pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = new Date().getTime() + '';
        cert.validity.notBefore = new Date();
        cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 10);
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 10);

        const attrs = [
            {
                name: 'commonName',
                value: 'LightProxy-' + new Date().toISOString().slice(0, 10),
            },
            {
                name: 'countryName',
                value: 'CN',
            },
            {
                shortName: 'ST',
                value: 'Hangzhou',
            },
            {
                name: 'localityName',
                value: 'Hangzhou',
            },
            {
                name: 'organizationName',
                value: 'LightProxy',
            },
            {
                shortName: 'OU',
                value: 'https://github.com/alibaba/lightproxy',
            },
        ];

        cert.setSubject(attrs);
        cert.setIssuer(attrs);
        cert.setExtensions([
            {
                name: 'basicConstraints',
                critical: true,
                cA: true,
            },
            {
                name: 'keyUsage',
                critical: true,
                keyCertSign: true,
            },
            {
                name: 'subjectKeyIdentifier',
            },
        ]);
        cert.sign(keys.privateKey, forge.md.sha256.create());
        const certPem = pki.certificateToPem(cert);
        const keyPem = pki.privateKeyToPem(keys.privateKey);

        resolve({
            key: keyPem,
            cert: certPem,
        });
    });
}

function alertAndQuit() {
    dialog.showErrorBox(
        'Grant Authorization Failed 授权失败',
        `Grant Authorization Failed for install certificate and helper
macOS user Please input your user password when dialog
Windows user Please try to enable Property => Compatibility => Run program as Administrator
安装证书或者 helper 过程中授权失败
macOS 用户请尝试在弹出的对话框中输入用户密码
Windows 用户请尝试打开在 属性 => 兼容性 => 以管理员身份运营该应用

Application will quit
应用程序即将退出
    `,
    );
    treeKill(process.pid);
}

export async function installCertAndHelper() {
    console.log('Install cert');
    const certs = (await generateCert()) as {
        key: string;
        cert: string;
    };

    const dir = (await tempdir()).replace('ADMINI~1', 'Administrator');

    // 写入证书
    await fs.mkdirp(dir);
    await fs.writeFileAsync(path.join(dir, CERT_KEY_FILE_NAME), certs.key, 'utf-8');
    await fs.writeFileAsync(path.join(dir, CERT_FILE_NAME), certs.cert, 'utf-8');

    // 信任证书 & 安装 helper
    const installPromise = new Promise((resolve, reject) => {
        if (SYSTEM_IS_MACOS) {
            sudo.exec(
                `security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${path.join(
                    dir,
                    CERT_FILE_NAME,
                )}" && cp "${PROXY_CONF_HELPER_FILE_PATH}" "${PROXY_CONF_HELPER_PATH}" && chown root:admin "${PROXY_CONF_HELPER_PATH}" && chmod a+rx+s "${PROXY_CONF_HELPER_PATH}"`,
                sudoOptions,
                (error, stdout) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(stdout);
                },
            );
        } else {
            fs.copyFileSync(PROXY_CONF_HELPER_FILE_PATH, PROXY_CONF_HELPER_PATH);
            const command = `certutil -enterprise -f -v -AddStore "Root" "${path.join(dir, CERT_FILE_NAME)}"`;
            console.log('run command', command);
            try {
                const output = execSync(command, {
                    windowsHide: true,
                });
                console.log('certutil result', output.toString());
            } catch (e) {
                console.log('error', e.message, e.stderr.toString(), e.stdout.toString());
            }

            // windows dose not need install helper
            resolve();
        }
    });

    console.log('before install');
    try {
        await installPromise;
    } catch (e) {
        console.error(e);
        alertAndQuit();
        // prevent copy cert after failed
        return;
    }

    console.log('after install');
    // 信任完成，把证书目录拷贝过去
    await fs.copyAsync(dir, LIGHTPROXY_CERT_DIR_PATH);
    console.log('copy cert done');
}

export async function checkStartupPermission() {
    // if (!SYSTEM_IS_MACOS) {
    //     try {
    //         execSync('NET SESSION');
    //     } catch (e) {
    //         console.error(e);
    //         const whoaimContent = execSync('whoami /groups').toString();
    //         if (whoaimContent.indexOf('S-1-16-12288') !== -1 || whoaimContent.indexOf('S-1-5-32-544') !== -1 || whoaimContent.indexOf('-512 ') !== -1) {
    //             // see https://stackoverflow.com/questions/7985755/how-to-detect-if-cmd-is-running-as-administrator-has-elevated-privileges
    //             return;
    //         }
    //         alertAndQuit();
    //     }
    // }
}

async function checkCertInstall() {
    // 证书文件存在我就认为证书已经正确安装了
    // TODO: 也许可以做的更精准
    const certKeyExist = await fs.existsAsync(LIGHTPROXY_CERT_KEY_PATH);
    console.log('Cert install status:', certKeyExist);
    return certKeyExist;
}

async function checkHelperInstall() {
    if (!SYSTEM_IS_MACOS) {
        return true;
    }
    if (!(await fs.existsAsync(PROXY_CONF_HELPER_PATH))) {
        return false;
    }
    const info = await fs.statAsync(PROXY_CONF_HELPER_PATH);
    if (info.uid === 0) {
        // 已经安装
        return true;
    }
    return false;
}

// 检查安装状态，如果没安装就安装一下
export default async function checkInstallStatus() {
    if ((await checkCertInstall()) && (await checkHelperInstall())) {
        // pass
    } else {
        await installCertAndHelper();
    }
}
