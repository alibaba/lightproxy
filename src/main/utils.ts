import { BrowserWindow, ipcMain } from 'electron';

export function sendMessageToWindow(eventName: string, ...params: any) {
    console.log('send message to renderer', eventName, params);
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send(eventName, ...params);
    });
}
