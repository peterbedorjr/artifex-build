const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const chalk = require('chalk');

const { log, done, clearConsole, error } = require('../../utils/log');
const { logWithSpinner, stopSpinner } = require('../../utils/spinner');
const formatStats = require('../../utils/format-stats');

module.exports = (api, options) => {
    api.registerCommand('build', async (args) => {
        const targetDir = api.resolve(args.dest || path.resolve(options.paths.root, options.paths.output.root));
        const { mode } = api.artifex;

        if (!args.silent) {
            clearConsole();
            logWithSpinner(`Building for ${api.artifex.staging ? 'staging' : mode}...`);
        }

        return new Promise((resolve, reject) => {
            // Delete contents of output directory
            fs.removeSync(api.resolve('public'));

            let webpackConfig = api.resolveWebpackConfig();

            webpack(webpackConfig, (err, stats) => {
                stopSpinner(false);


                if (err) {
                    return reject(error(err.toString()));
                }

                if (stats.hasErrors()) {
                    const jsonStats = stats.toJson();
                    let errors = '';

                    if (Array.isArray(jsonStats.errors)) {
                        errors = jsonStats.errors.map((error) => error.message).join('\n\n');
                    } else {
                        errors = jsonStats.errors.message;
                    }

                    return resolve(errors);
                }

                const message = args.watch
                    ? `Build complete. Watching for changes...\n\n`
                    : `Compiled successfully in ${stats.endTime - stats.startTime}ms\n\n`

                clearConsole();
                done(chalk.green(message));
                log(formatStats(stats, targetDir, api));

                if (api.artifex.mode === 'production') {
                    done(`Build complete.\n`);
                }

                resolve();
            });
        });
    });
};
