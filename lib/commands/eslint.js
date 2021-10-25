const { ESLint } = require('eslint');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { error, log, done } = require('../../utils/log');

module.exports = (api, options) => {
    api.registerCommand('eslint', async (args) => {
        const cwd = api.resolve('.');
        const configPath = api.resolveConfigFile('eslint')
            ? api.resolveConfigFile('eslint')
            : path.resolve(__dirname, '../config', 'eslint', '.eslintrc.js');
        const paths = (function() {
            this.scripts = api.resolveSourcePath(options.paths.source.scripts);
            this.components = `${this.scripts}/${options.paths.source.components}`;
            this.pages = `${this.scripts}/${options.paths.source.pages}`;

            const { scripts, components, pages } = this;

            return {
                scripts,
                components,
                pages,
            }
        })();

        if (!fs.existsSync(configPath)) {
            return error('Missing eslint configuration file.');
        }

        const config = { overrideConfig: require(configPath) };

        config.fix = !!args.fix;

        const engine = new ESLint(config);

        const files = [`${paths.scripts}/**/*.js`];

        if (fs.existsSync(paths.components)) {
            files.push(`${paths.components}/**/*.{js,vue}`);
        }

        if (fs.existsSync(paths.pages)) {
            files.push(`${paths.pages}/**/*.{js,vue}`);
        }

        const resultResults = await engine.lintFiles(files)

        if (config.fix) {
            ESLint.outputFixes(resultResults);
        }

        const reportErrorCount = resultResults.reduce((p, c) => p + c.errorCount, 0);
        const reportWarningCount = resultResults.reduce((p, c) => p + c.warningCount, 0);
        const formatter = await engine.loadFormatter(args.format || 'codeframe');

        if (! args.silent) {
            const hasFixed = resultResults.some((f) => f.output);

            if (hasFixed) {
                log(`The following files have been auto-fixed:`);
                log();

                resultResults.forEach((f) => {
                    if (f.output) {
                        log(`  ${chalk.blue(path.relative(cwd, f.filePath))}`);
                    }
                });

                log();
            }

            if (reportWarningCount || reportErrorCount) {
                formatter.format(resultResults);
            } else {
                done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`);
            }
        }
    });
};
