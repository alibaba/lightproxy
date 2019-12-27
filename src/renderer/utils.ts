import { CoreAPIClass } from './core-api';

export function lazyParseData(str: string) {
    const EVENT_NAME_HEAD_LENGTH = 50;
    const eventName = str.slice(0, EVENT_NAME_HEAD_LENGTH).replace(/\s+$/, '');
    return {
        eventName,
        get data() {
            return JSON.parse(str.slice(EVENT_NAME_HEAD_LENGTH));
        },
    };
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export async function getWhistlePort(coreAPI: CoreAPIClass): Promise<number> {
    return new Promise(resolve => {
        const resolveFn = (port: number) => {
            resolve(port);
            coreAPI.eventEmmitter.off('whistle-get-port-response', resolveFn);
        };
        coreAPI.eventEmmitter.on('whistle-get-port-response', resolveFn);
        coreAPI.eventEmmitter.emit('whistle-get-port');
    });
}
