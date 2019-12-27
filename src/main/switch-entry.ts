import { hideIconInDock } from './platform';
import logger from 'electron-log';

logger.info('env', process.env.ELECTRON_RUN_MODULE);

if (process.env.ELECTRON_RUN_MODULE) {
    hideIconInDock();
    logger.info('Spawn a electron process for moduole', process.env.ELECTRON_RUN_MODULE);
    // skip webpack hack
    eval(`require("${process.env.ELECTRON_RUN_MODULE}")`);
} else {
    require('./main');
}
