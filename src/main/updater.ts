import { DownloaderHelper } from 'node-downloader-helper';
import fetch from 'node-fetch';
import logger from 'electron-log';
import { version } from '../../package.json';
import { LIGHTPROXY_UPDATE_DIR, LIGHTPROXY_UPDATE_CONFIG, SYSTEM_IS_MACOS } from './const';
import fs from 'fs-extra-promise';
import Store from 'electron-store';

export async function checkUpdater() {
    const store = new Store();
    const settings = store.get('settings');
    const updateChannel = settings.updateChannel || 'stable';

    try {
        const url =
            updateChannel === 'stable'
                ? 'https://gw.alipayobjects.com/os/LightProxy/release.json'
                : 'https://gw.alipayobjects.com/os/LightProxy/beta-release.json';
        const res = await fetch(url);
        const data = await res.json();
        logger.info('get update info', data);
        if (data.version !== version) {
            logger.info(`Version update: ${version} => ${data.version}`);
            try {
                fs.removeSync(LIGHTPROXY_UPDATE_DIR);
            } catch (e) {}
            fs.mkdirpSync(LIGHTPROXY_UPDATE_DIR);

            const dl = new DownloaderHelper(SYSTEM_IS_MACOS ? data['asar'] : data['win_asar'], LIGHTPROXY_UPDATE_DIR);

            const dlPromise = new Promise((resolve, reject) => {
                // @ts-ignore
                dl.on('end', downloadInfo => {
                    logger.info('Download complete');

                    const asarPath = downloadInfo.filePath.replace(/\.asar_$/, '.asar');

                    if (fs.existsSync(asarPath)) {
                        try {
                            fs.removeSync(asarPath);
                        } catch (e) {}
                    }
                    fs.moveSync(downloadInfo.filePath, asarPath);

                    fs.writeFileSync(
                        LIGHTPROXY_UPDATE_CONFIG,
                        JSON.stringify({
                            md5: SYSTEM_IS_MACOS ? data['md5'] : data['win_md5'],
                            path: asarPath,
                        }),
                    );
                    resolve(true);
                });

                dl.on('error', e => {
                    logger.error(e);
                    reject(e);
                });

                dl.start();
            });

            return await dlPromise;
        } else {
            logger.info('Same version', version);
            return false;
        }
    } catch (e) {
        logger.error(e);
        throw e;
    }
}
