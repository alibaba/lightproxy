const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const baseConfig = require('./webpack.base.config');
const pkg = require('../package.json');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = merge.smart(baseConfig, {
    target: 'electron-renderer',
    entry: {
        app: ['@babel/polyfill', './src/renderer/index.tsx'],
    },
    externals: {
        electron: 'require("electron")',
        'monaco-editor': 'window.monaco',
        'monaco-editor/esm/vs/editor/editor.api': 'window.monaco',
        '@timkendrick/monaco-editor': 'window.monaco',
        '@timkendrick/monaco-editor/dist/external': 'window.monaco',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    babelrc: false,
                    presets: [
                        ['@babel/preset-env', { targets: { browsers: 'last 2 versions ' } }],
                        '@babel/preset-typescript',
                        '@babel/preset-react',
                    ],
                    plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
                },
            },
            {
                test: /\.(le|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            reportFiles: ['src/renderer/**/*'],
        }),
        new HtmlWebpackPlugin({
            title: pkg.title,
            template: path.resolve(__dirname, '../src/index.ejs'),
        }),

        new CopyPlugin([
            { from: './node_modules/@timkendrick/monaco-editor/dist/external/index.js', to: './monaco.js' },
            { from: './node_modules/@timkendrick/monaco-editor/dist/external/monaco.css', to: './monaco.css' },
            { from: './devtools-frontend', to: './devtools-frontend' },
            { from: './files', to: './files' },
        ]),
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
        }),
    ],
});
