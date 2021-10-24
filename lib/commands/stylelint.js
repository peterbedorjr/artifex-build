const path = require('path');
const stylelint = require('stylelint');

const { log, info } = require('../../utils/log');

module.exports = (api, options) => {
    api.registerCommand('stylelint', async (args) => {
        const context = api.resolve('.');
        const configFile = api.resolveConfigFile('stylelint')
            ? api.resolveConfigFile('stylelint')
            : path.resolve(__dirname, '../config/stylelint/', '.stylelintrc.js');
        const fix = args.fix === true;

        const results = await stylelint.lint({
            fix,
            context,
            configFile,
            files: [
                `${api.resolveSourcePath(options.paths.source.styles)}/**/*.scss`,
                `${api.resolveSourcePath(options.paths.source.scripts, options.paths.source.components)}/**/*.scss`,
                `${api.resolveSourcePath(options.paths.source.scripts, options.paths.source.pages)}/**/*.scss`,
            ],
            configBasedir: path.resolve(__dirname, '../../'),
            formatter: require('stylelint-codeframe-formatter'),
            emitErrors: false,
        });

        if (! args.silent && fix) {
            info('Some files may have been fixed');
        }

        log(results.output);
    });
};
