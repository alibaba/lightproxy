import { app, BrowserWindow } from 'electron';
import path from 'path';
import { store } from './redux-master';

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

app.on('ready', () => {
    createMainWindow();

    console.log(store);
});
