import { hideIconInDock } from './platform';
import logger from 'electron-log';
import { app } from 'electron';

logger.info('env', process.env.ELECTRON_RUN_MODULE);

if (process.env.ELECTRON_RUN_MODULE) {
    hideIconInDock();
    app.on('ready', () => {
        try {
            // try to fix https://github.com/alibaba/lightproxy/issues/2
            hideIconInDock();
        } catch (e) {
            // pass
        }
    });
    logger.info('Spawn a electron process for moduole', process.env.ELECTRON_RUN_MODULE);
    // skip webpack hack
    eval(`require("${process.env.ELECTRON_RUN_MODULE}")`);
} else {
    require('./main');
}
