'use strict';

const path = require('path');

module.exports = {
    mode: 'development',
    node: {
        __dirname: false,
        __filename: false,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    devtool: 'source-map',
    plugins: [],
};
