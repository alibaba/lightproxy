const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = config => {
    delete config.output.libraryTarget;

    config.externals = {
        electron: 'require("electron")',
        'monaco-editor': 'window.monaco',
        'monaco-editor/esm/vs/editor/editor.api': 'window.monaco',
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
