const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const is = require('../../utils/is');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        let htmlConfig = {
            title: options.appName || '',
            filename: '../index.html',
        };

        if (is.string(options.html)) {
            htmlConfig.template = api.resolveSourcePath('index.html');
        }

        if (is.object(options.html)) {
            htmlConfig = {
                ...htmlConfig,
                ...options.html,
            }
        }

        // HTML generation
        config.plugin('html')
            .use(HtmlWebpackPlugin, [htmlConfig]);
    });
}
