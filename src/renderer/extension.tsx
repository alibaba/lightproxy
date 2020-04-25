import { CoreAPI } from './core-api';

import logger from 'electron-log';

export class Extension {
    private mId: string;
    public coreAPI = CoreAPI;

    constructor(id: string) {
        this.mId = id;
        logger.info('Init extension', this.mId);
    }

    statusbarRightComponent(): Function | null {
        return null;
    }

    panelComponent(): Function | null {
        return null;
    }

    panelIcon(): string {
        return 'experiment';
    }

    panelTitle(): string {
        return 'unkown';
    }

    keepAlive() {
        return false;
    }

    name() {
        return this.constructor.name;
    }
}
