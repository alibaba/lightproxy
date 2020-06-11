import exitHook from 'exit-hook';
import spwan from 'cross-spawn';
import { ipcMain } from 'electron-better-ipc';
import logger from 'electron-log';
import fs from 'fs-extra';

import { BoardcastManager } from './boradcast-manager';
import { checkSystemProxyWork, setSystemProxy } from './platform';
import checkInstallStatus from './install';
import treeKill from 'tree-kill';
import ip from 'ip';
import { checkUpdater } from './updater';
import path from 'path';
import { LIGHTPROXY_FILES_DIR, LIGHTPROXY_CFG_FILE_PATH } from './const';
import { app, nativeTheme, BrowserWindow, dialog } from 'electron';

interface SwpanModuleProp {
    moduleId: string;
    env: any;
    keepAlive: boolean;
}
async function checkInstall() {
    await checkInstallStatus();
}
async function spawnModule(props: any) {
    const { moduleId, env = {} } = props as SwpanModuleProp;
    logger.info('spawn module', moduleId);
    const boardcastPort = (await BoardcastManager.getInstance()).getPort();

    logger.info('boardcast port', boardcastPort);

    const nodeModulePath = path.join(LIGHTPROXY_FILES_DIR, `/node/node_modules/`);
    const modulePath = encodeURIComponent(path.join(nodeModulePath, `${moduleId}/index.js`));

    const nodeScript = `
const cp = require('child_process');
const originSpwan = cp.spawn;

// @ts-ignore
cp.spawn = function(cmd, argv, options) {
    if (cmd === 'node' || cmd === 'node.exe') {
        cmd = process.execPath;
        options = options || {};
        options.env = options.env || {};
        options.env.ELECTRON_RUN_AS_NODE = '1';
    }

    return originSpwan.call(this, cmd, argv, options);
};
require(decodeURIComponent('${modulePath}'));`;
    const startProcess = () => {
        const child = spwan(
            process.execPath,
            [
                '-e',
                `const code = decodeURIComponent("${encodeURIComponent(nodeScript)}");console.log(code);eval(code);`,
                '--tls-min-v1.0',
                '--max-http-header-size=256000',
                '--http-parser=legacy',
            ],
            {
                env: {
                    ...process.env,
                    ...env,
                    ELECTRON_RUN_MODULE: moduleId,
                    LIGHTPROXY_BOARDCASR_PORT: boardcastPort,
                    USER_DATA: app.getPath('appData'),
                    NODE_PATH: nodeModulePath,
                    ELECTRON_RUN_AS_NODE: 1,
                },
            },
        );
        logger.info('Spwaned process', process.execPath, child.pid);

        exitHook(() => {
            child.kill();
        });

        child?.stderr?.on('data', data => {
            logger.error(`[pid ${child.pid}]stderr: ${data.toString()}`);
        });

        child?.stdout?.on('data', data => {
            logger.info(`[pid ${child.pid}]stdout: ${data.toString()}`);
        });

        return child.pid;
    };

    return startProcess();
}

async function getBoradcastPort() {
    const instance = await BoardcastManager.getInstance();
    return instance.getPort();
}

async function treeKillProcess(pid: any) {
    return new Promise(resolve => {
        treeKill(pid, 'SIGKILL', err => {
            if (err) {
                logger.error(err);
            }
            resolve();
        });
    });
}

async function getIp() {
    return ip.address();
}

async function checkDarkMode(mainWindow: BrowserWindow) {
    nativeTheme.on('updated', () => {
        ipcMain.callRenderer(mainWindow, 'updateDarkMode', nativeTheme.shouldUseDarkColors);
    });
    return nativeTheme.shouldUseDarkColors;
}

async function update() {
    return checkUpdater();
}

async function checkSystemProxy(props: any) {
    const { port, address } = props;
    return checkSystemProxyWork(address, port);
}

async function exportConfig(i18n: unknown) {
    const { title, buttonLabel } = i18n as Record<string, string>;
    const checkExists = await fs.pathExists(LIGHTPROXY_CFG_FILE_PATH);
    if (!checkExists) {
        throw Error('Config is not exists');
    }
    const cfg = (await fs.readFile(LIGHTPROXY_CFG_FILE_PATH)).toString();
    const { canceled, filePath } = await dialog.showSaveDialog({
        title,
        buttonLabel,
        filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (!canceled && filePath) {
        await fs.writeFile(filePath, cfg);
        return true;
    }
}

async function importConfig(i18n: unknown) {
    const { title, buttonLabel } = i18n as Record<string, string>;
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title,
        buttonLabel,
        filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (!canceled && filePaths[0]) {
        const [path] = filePaths;
        const checkExists = await fs.pathExists(path);
        if (!checkExists) {
            throw Error('Could not found config file.');
        }
        const fileBuffer = await fs.readFile(path as string);
        return JSON.parse(fileBuffer.toString());
    }
}

export async function initIPC(mainWindow: BrowserWindow) {
    // ipcMain
    ipcMain.answerRenderer('spawnModule', spawnModule);
    ipcMain.answerRenderer('checkInstall', checkInstall);

    ipcMain.answerRenderer('getBoradcastPort', getBoradcastPort);
    // @ts-ignore
    ipcMain.answerRenderer('setSystemProxy', setSystemProxy);

    ipcMain.answerRenderer('treeKillProcess', treeKillProcess);

    ipcMain.answerRenderer('getIp', getIp);

    ipcMain.answerRenderer('checkDarkMode', () => checkDarkMode(mainWindow));

    ipcMain.answerRenderer('update', update);

    ipcMain.answerRenderer('checkSystemProxy', checkSystemProxy);

    ipcMain.answerRenderer('exportConfig', exportConfig);

    ipcMain.answerRenderer('importConfig', importConfig);

    // start a socketIO server for extension background process
    await BoardcastManager.getInstance();

    exitHook(async () => {
        await setSystemProxy(0);
    });
}
