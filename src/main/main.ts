'use strict';

import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, shell } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import { initIPC } from './api';
import { checkUpdater } from './updater';
import { hideOrQuit } from './platform';
import {
    SYSTEM_IS_MACOS,
    NEW_ISSUE_PAGE,
    GITHUB_PROJECT_PAGE,
    LIGHTPROXY_HOME_PATH,
    LIGHTPROXY_FILES_DIR,
    LIGHTPROXY_NODEJS_PATH,
} from './const';
import { version } from '../../package.json';
import ua from 'universal-analytics';
import { CoreAPI } from '../renderer/core-api';
import { uuidv4 } from '../renderer/utils';
import windowStateKeeper from 'electron-window-state';
import os from 'os';
import fs from 'fs-extra';
import electronIsDev from 'electron-is-dev';

const isDevelopment = process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;

let appReady = false;

app.commandLine.appendSwitch('--no-proxy-server');
app.commandLine.appendSwitch('disable-site-isolation-trials');

function copyFileSync(source: string, target: string) {
    let targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source: string, target: string) {
    let files = [];

    //check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function(file) {
            const curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

// @ts-ignore
// will be used in renderer
global.__static = __static;

// @ts-ignore
global.__filesDir = LIGHTPROXY_FILES_DIR;

try {
    if (!fs.existsSync(LIGHTPROXY_FILES_DIR)) {
        fs.mkdirpSync(LIGHTPROXY_FILES_DIR);
    }

    const versionFile = path.join(LIGHTPROXY_FILES_DIR, 'version');
    if (fs.existsSync(versionFile) && fs.readFileSync(versionFile, 'utf-8') === version && !electronIsDev) {
        // pass
    } else {
        fs.removeSync(LIGHTPROXY_FILES_DIR);
        copyFolderRecursiveSync(
            electronIsDev ? path.join(__dirname, '../../files/') : path.join(__dirname, './files/'),
            LIGHTPROXY_HOME_PATH,
        );
        fs.chmodSync(LIGHTPROXY_NODEJS_PATH, '775');
        fs.moveSync(
            path.join(LIGHTPROXY_FILES_DIR, '/node/modules'),
            path.join(LIGHTPROXY_FILES_DIR, '/node/node_modules'),
        );
        fs.writeFileSync(versionFile, version, 'utf-8');
    }
} catch (e) {
    console.error(e);
}

const timer = setInterval(async () => {
    const result = await checkUpdater();
    if (result) {
        clearInterval(timer);
    }
}, 1000 * 60 * 60);

if (process.argv.indexOf('--update') !== -1) {
    checkUpdater();
}

let forceQuit = false;

function createMainWindow() {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1100,
        defaultHeight: 700,
    });
    const window = new BrowserWindow({
        height: mainWindowState.height,
        width: mainWindowState.width,
        minHeight: 700,
        minWidth: 1100,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        },
        // https://github.com/alibaba/lightproxy/issues/22
        // disable frameless in Windows
        frame: SYSTEM_IS_MACOS ? false : true,
        x: mainWindowState.x,
        y: mainWindowState.y,
    });

    mainWindowState.manage(window);

    if (isDevelopment) {
        window.webContents.openDevTools();
    }

    if (isDevelopment) {
        window.loadURL(`http://localhost:2333`);
    } else {
        window.loadURL(
            formatUrl({
                pathname: path.join(__dirname, './index.html'),
                protocol: 'file',
                slashes: true,
            }),
        );
    }

    window.on('close', event => {
        if (!forceQuit) {
            hideOrQuit();
            event?.preventDefault();
        }
    });

    window.webContents.on('devtools-opened', () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    return window;
}

function setApplicationMenu() {
    const defaultMenu = Menu.getApplicationMenu();
    const applicationMenu = new Menu();

    (defaultMenu?.items ?? [])
        .filter(menu => {
            // remove the original help menu
            return menu.role !== 'help';
        })
        .forEach(menu => {
            if (menu.role === 'viewMenu') {
                const subMenu = new Menu();
                (menu.submenu?.items ?? []).forEach(item => subMenu.append(item));
                menu.submenu = subMenu;
                applicationMenu.append(
                    new MenuItem({
                        type: menu.type,
                        label: menu.label,
                        submenu: subMenu,
                    }),
                );
            } else {
                applicationMenu.append(menu);
            }
        });

    // append custom help menu
    const helpSubMenu = new Menu();
    const helpSubMenuConfig: MenuItemConstructorOptions[] = [
        {
            label: 'Project Homepage',
            click: function() {
                shell.openExternal(GITHUB_PROJECT_PAGE);
            },
        },
        {
            label: 'Report Issue',
            click: function() {
                shell.openExternal(NEW_ISSUE_PAGE);
            },
        },
    ];
    helpSubMenuConfig.forEach(option => {
        helpSubMenu.append(new MenuItem(option));
    });
    applicationMenu.append(
        new MenuItem({
            label: 'Help',
            type: 'submenu',
            submenu: helpSubMenu,
        }),
    );

    Menu.setApplicationMenu(applicationMenu);
}

app.on('before-quit', function() {
    forceQuit = true;
});

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (SYSTEM_IS_MACOS) {
        app.quit();
    }
});

app.on('activate', () => {
    if (!appReady) {
        // fix `Cannot create BrowserWindow before app is ready`
        return;
    }
    // on macOS it is common to re-create a window even after all windows have been closed
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
    mainWindow.show();
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    appReady = true;
    mainWindow = createMainWindow();
    setApplicationMenu();
    initIPC();

    if (!CoreAPI.store.get('userid')) {
        CoreAPI.store.set('userid', uuidv4());
    }

    const userid = CoreAPI.store.get('userid');

    const visitor = ua('UA-154996514-1', userid);

    // app-version
    visitor.set('dimension1', version);
    // os
    visitor.set('dimension2', os.type());
    visitor.set('os-version', os.release());
    // electron-version
    visitor.set('dimension3', process.versions.electron);
    visitor
        .pageview('/', err => {
            console.error(err);
        })
        .send();

    setInterval(() => {
        visitor.pageview('/').send();
    }, 1000 * 60 * 30);
});
