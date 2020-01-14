const merge = require('webpack-merge');

const baseConfig = require('./webpack.main.config');

module.exports = merge.smart(baseConfig, {
    mode: 'production',
});
