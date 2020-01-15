const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const baseConfig = require('./webpack.renderer.config');

if (process.env.BUNDLE_ANALYZER) {
    baseConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = merge.smart(baseConfig, {
    mode: 'production',
});
