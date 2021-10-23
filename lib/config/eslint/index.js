const EslintPlugin = require('eslint-webpack-plugin');
const path = require('path');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const eslintOptions = {
            context: api.artifex.context,
            formatter: 'codeframe',
        };

        if (! api.resolveConfigFile('eslint')) {
            eslintOptions.overrideConfigFile = path.resolve(__dirname, '.eslintrc.js');
        }

        config.plugin('eslint')
            .use(EslintPlugin, [eslintOptions]);
    });
}
