import { ipcRenderer } from 'electron-better-ipc';

// @ts-ignore
import EventEmitter from 'mini-event-emitter';

import EventEmitterType from 'event-emitter';

import Store from 'electron-store';

export class CoreAPIClass {
    private mEventEmitter: EventEmitterType.Emitter;
    private mStore: Store;

    constructor() {
        this.mEventEmitter = new EventEmitter({ trace: true });
        this.mStore = new Store();
    }
    async spawnModule(moduleId: string, keepAlive = false, env = {} as Record<string, string>) {
        const result = await ipcRenderer.callMain('spawnModule', { moduleId, env, keepAlive });
        return result as number;
    }

    async joinBoardcast() {
        const port = await ipcRenderer.callMain('getBoradcastPort');
        const client = new WebSocket(`ws://127.0.0.1:${port}/`);

        return client;
    }

    get store() {
        return this.mStore;
    }

    async checkInstall() {
        return await ipcRenderer.callMain('checkInstall');
    }

    async setSystemProxy(port: number) {
        return await ipcRenderer.callMain('setSystemProxy', port);
    }

    get eventEmmitter() {
        return this.mEventEmitter;
    }

    async getIp() {
        return (await ipcRenderer.callMain('getIp')) as string;
    }

    async treeKillProcess(pid: number) {
        return await ipcRenderer.callMain('treeKillProcess', pid);
    }

    async update() {
        return await ipcRenderer.callMain('update');
    }
}

export const CoreAPI = new CoreAPIClass();
