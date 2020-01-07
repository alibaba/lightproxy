const path = require('path');
const getPort = require('get-port');
const { app } = require('electron');

const userData = path.join(app.getPath('appData'), '/LightProxy');
const ws = require('ws');

const startWhistle = require('whistle/index');

const globalPaths = require('npm-paths');
const logger = require('electron-log');

if (!process.argv || process.argv.length < 2) {
    process.argv = ['mock', 'mock'];
}

const start = options => {
    return new Promise(resolve => {
        startWhistle(options, resolve);
    });
};

const pluginPaths = globalPaths().concat('/usr/local/lib/node_modules/');

console.log('pluginPaths', pluginPaths);

const boardcastPort = process.env.LIGHTPROXY_BOARDCASR_PORT;

logger.info('Whistle get boardcast port', boardcastPort);

const client = new ws(`ws://127.0.0.1:${boardcastPort}`);
const clientReady = new Promise(resolve => {
    client.onopen = () => {
        resolve();
    };
});

client.onerror = err => {
    logger.error(err);
};

const options = {
    name: 'LightProxyWhistle',
    port: 12888,
    certDir: path.join(userData, './cert'),
};

const whistleStoragePath = path.join(userData, './whistle');

logger.info('use custom cert:', options.certDir);
(async () => {
    try {
        const port = await getPort({ port: 12888 });

        console.log('Use port:', port);
        // @ts-ignore
        process.env.WHISTLE_PORT = port;

        start({
            port,
            storage: whistleStoragePath,
            certDir: options.certDir,
            pluginPaths,
        })
            .then(() => {
                logger.info('Whistle for LightProxy start: http://127.0.0.1:' + port);
                return clientReady;
            })
            .then(() => {
                client.send(
                    'whistle-ready'.padEnd(50, ' ') +
                        JSON.stringify({
                            port,
                        }),
                );
            })
            .catch(e => {
                logger.error(e);
            });
    } catch (e) {
        logger.error(e);
    }
})();
