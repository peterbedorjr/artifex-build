const path = require('path');
const stylelint = require('stylelint');
const { log } = require('../utils/log');

module.exports = (api, options) => {
    api.registerCommand('stylelint', async (args) => {
        const paths = api.artifex.resolvePaths();
        const context = api.resolve('.');
        const configFile = api.resolveConfigFile('stylelint')
            ? api.resolveConfigFile('stylelint')
            : path.resolve(__dirname, '../config/stylelint/', '.stylelintrc.js');

        const results = await stylelint.lint({
            context,
            configFile,
            fix: args.fix === true,
            files: [
                `${paths.styles}/app.scss`,
                // `${paths.styles}/**/*.scss`,
                // `${paths.components}/**/*.scss`,
            ],
            configBasedir: path.resolve(__dirname, '../../'),
            // fix: options.fixStyles === true, TODO
            formatter: require('stylelint-codeframe-formatter'),
        });

        log(results.output);
    });
};