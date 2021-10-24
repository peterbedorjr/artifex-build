const StylelintPlugin = require('stylelint-webpack-plugin');
const path = require('path');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const context = api.resolve('.');
        const configFile = api.resolveConfigFile('stylelint')
            ? api.resolveConfigFile('stylelint')
            : path.resolve(__dirname, '.stylelintrc.js');

        // Lint styles
        config.plugin('stylelint')
            .use(StylelintPlugin, [{
                context,
                configFile,
                fix: options.style.fix === true,
                configBasedir: path.resolve(__dirname, '../../../'),
                formatter: require('stylelint-codeframe-formatter'),
            }])
            .end();
    });
}
