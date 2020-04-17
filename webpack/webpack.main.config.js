const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { version } = require('../package.json');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const baseConfig = require('./webpack.base.config');

module.exports = merge.smart(baseConfig, {
    target: 'electron-main',
    entry: {
        main: './src/main/index.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    babelrc: false,
                    presets: [
                        ['@babel/preset-env', { targets: 'maintained node versions' }],
                        '@babel/preset-typescript',
                    ],
                    plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
                },
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                  {
                    loader: 'url-loader',
                    options: {
                      limit: 8192,
                    },
                  },
                ],
            }
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            reportFiles: ['src/main/**/*'],
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
            '__PACKAGE_INFO_VERSION__': JSON.stringify(version),
        }),
    ],
});
