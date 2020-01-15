/* eslint-disable no-console */
const merge = require('webpack-merge');
const spawn = require('child_process').spawn;

const baseConfig = require('./webpack.renderer.config');

module.exports = merge.smart(baseConfig, {
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
        },
    },
    devServer: {
        port: 2333,
        compress: true,
        noInfo: true,
        stats: 'errors-only',
        inline: true,
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false,
        },
        before() {
            if (process.env.START_HOT) {
                console.log('Starting main process');
                spawn('npm', ['run', 'main-dev'], {
                    shell: true,
                    env: process.env,
                    stdio: 'inherit',
                })
                    .on('close', code => process.exit(code))
                    .on('error', spawnError => console.error(spawnError));
            }
        },
    },
});
