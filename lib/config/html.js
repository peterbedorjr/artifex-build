const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isObject = require('../utils/isObject');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        let defaults = {
            title: options.appName || '',
            template: path.resolve(api.artifex.paths.source, 'index.html'),
            filename: '../../index.html',
        };

        if (typeof options.html === 'string') {
            defaults.template = path.resolve(api.artifex.paths.source, options.html);
        } else if (isObject(options.html)) {
            defaults = {
                ...defaults,
                ...options.html,
            };
        }

        // HTML generation
        config.plugin('html')
            .use(HtmlWebpackPlugin, [defaults]);
    });
}
