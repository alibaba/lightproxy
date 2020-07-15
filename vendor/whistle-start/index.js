const path = require('path');
const portfinder = require('portfinder');

const userData = path.join(process.env.USER_DATA, '/LightProxy');
const ws = require('ws');

const startWhistle = require('whistle/index');

const glob = require('glob');

if (!process.argv || process.argv.length < 2) {
    process.argv = ['mock', 'mock'];
}

const start = options => {
    return new Promise(resolve => {
        startWhistle(options, resolve);
    });
};

const pluginPaths = glob.sync("/usr/local/lib/node_modules/").concat(
    glob.sync(process.env.HOME + '/.nvm/versions/node/*/lib/node_modules/')
).concat(
    glob.sync(`${process.env.AppData}\npm\node_modules/`)
).concat(
    glob.sync(`${process.env.AppData}\npm\node_modules/`)
).concat(
    glob.sync(__dirname + '/node_modules')
).concat(
    glob.sync(__dirname + '/../../node_modules')
)

console.log('pluginPaths', pluginPaths);

const boardcastPort = process.env.LIGHTPROXY_BOARDCASR_PORT;

console.info('Whistle get boardcast port', boardcastPort);

const client = new ws(`ws://127.0.0.1:${boardcastPort}`);
const clientReady = new Promise(resolve => {
    client.onopen = () => {
        resolve();
    };
});

client.onerror = err => {
    console.error(err);
};

const options = {
    name: 'LightProxyWhistle',
    // port: 12888,
    certDir: path.join(userData, './cert'),
};

const whistleStoragePath = path.join(userData, './whistle');

console.info('use custom cert:', options.certDir);
(async () => {
    try {
        const port = await portfinder.getPortPromise({ port: Number.parseInt(process.env.DEFAULT_PORT) });
        const socksPort = await portfinder.getPortPromise({ port: port + 1 });

        console.log('Use port:', {port, socksPort});
        // @ts-ignore
        process.env.WHISTLE_PORT = port;

        const opts = {
            host: process.env.WHISTLE_HOST || '127.0.0.1',
            port,
            socksPort,
            storage: whistleStoragePath,
            certDir: options.certDir,
            pluginPaths: pluginPaths.filter(item => typeof item === 'string' && item !== 'undefined'),
            mode: 'disableUpdateTips',
            username: process.env.WHISTLE_USERNAME,
            password: process.env.WHISTLE_PASSWORD,
            mode: 'classic|buildIn' + (process.env.WHISTLE_DISABLE_TLS_CHECK === '1' ? '': '|safe'),
        };

        console.log('opts', opts);

        start(opts)
            .then(() => {
                console.info('Whistle for LightProxy start: http://127.0.0.1:' + port);
                console.info('Whistle start for socks port:' + socksPort);
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
                console.error(e);
            });
    } catch (e) {
        console.error(e);
    }
})();
