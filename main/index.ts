process.on('uncaughtException', (err) => {
  console.error(err);
});

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initApp } from './init';

let win;

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
  await initAppPomise;
  createMainWindow();
});
