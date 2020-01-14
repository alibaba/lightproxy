const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = config => {
    delete config.output.libraryTarget;

    config.externals = {
        electron: 'require("electron")',
        'monaco-editor': 'window.monaco',
        'monaco-editor/esm/vs/editor/editor.api': 'window.monaco',
        '@timkendrick/monaco-editor': 'window.monaco',
        '@timkendrick/monaco-editor/dist/external': 'window.monaco'
    };

    config.plugins = config.plugins.filter(item => {
        if (!item) {
            return;
        }
        if (!item.constructor) {
            return;
        }
        return item.constructor.name !== 'MiniCssExtractPlugin';
    });

    config.plugins.push(new CopyPlugin([
        { from: './node_modules/@timkendrick/monaco-editor/dist/external/index.js', to: './monaco.js' },
        { from: './node_modules/@timkendrick/monaco-editor/dist/external/monaco.css', to: './monaco.css' },
        // { from: './static/iconTemplate.png', to: './iconTemplate.png' },
        // { from: './static/iconTemplate@2x.png', to: './iconTemplate@2x.png' },
        { from: './devtools-frontend', to: './devtools-frontend' },
        { from: './files', to: './files' },
    ]));

    if (process.env.BUNDLE_ANALYZER) {
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    if (config.devServer) {
        config.devServer.writeToDisk = true;
    }

    config.module.rules.forEach(rule => {
        if (/css|less/.test(rule.test.toString())) {
            rule.use = rule.use.filter(item => {
                if (typeof item !== 'string') {
                    return true;
                }

                return item.indexOf('mini-css-extract-plugin') === -1;
            });

            rule.use.unshift('style-loader');

            if (/less/.test(rule.test.toString())) {
                rule.use[3] = {
                    loader: 'less-loader',
                    options: {
                        javascriptEnabled: true
                    }
                }
            }
            // console.log(rule.use);
        }
    });

    return config;
};
