process.on('uncaughtException', (err) => {
  console.error(err);
});

import defaultMenu from 'electron-default-menu';
import { app, BrowserWindow, Menu, dialog, shell } from 'electron';
import path from 'path';
import { initApp } from './init';

let win;

function initMenu() {
  // Get default menu template
  const menu = defaultMenu(app, shell);

  // Add custom menu
  menu.splice(4, 0, {
    label: 'Custom',
    submenu: [
      {
        label: 'Do something',
        click: (item, focusedWindow) => {
          dialog.showMessageBox({ message: 'Do something', buttons: ['OK'] });
        },
      },
    ],
  });

  // Set application menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function createMainWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js'),
    },
  });

  win.loadURL('http://localhost:8080');

  win.show();
}

const initAppPomise = initApp();

app.on('ready', async () => {
  initMenu();
  await initAppPomise;
  createMainWindow();
});
