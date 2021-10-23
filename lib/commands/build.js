const webpack = require('webpack');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { log, done, clearConsole, error } = require('../utils/log');
const { logWithSpinner, stopSpinner } = require('../utils/spinner');
const formatStats = require('../utils/formatStats');

module.exports = (api, options) => {
    api.registerCommand('build', async (args) => {
        const targetDir = api.resolve(args.dest || path.resolve(options.paths.root, api.artifex.paths.assets));
        const mode = api.artifex.mode;

        if (!args.silent) {
            clearConsole();
            logWithSpinner(`Building for ${api.artifex.staging ? 'staging' : mode}...`);
        }

        if (args.silent || args.lint === false) {
            api.chainWebpack((config) => {
                config.module.rules.delete('eslint');
            });
        }

        let webpackConfig = api.resolveWebpackConfig();

        if (args.watch) {
            modifyConfig(webpackConfig, (config) => {
                config.watch = true;
            });
        }

        if (args.report || options.analyze) {
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

            modifyConfig(webpackConfig, (config) => {
                const bundleName = args.target !== 'app'
                    ? config.output.filename.replace(/\.js$/, '-')
                    : isLegacyBuild ? 'legacy-' : '';

                config.plugins.push(new BundleAnalyzerPlugin({
                    logLevel: 'warn',
                    openAnalyzer: true,
                    analyzerMode: (args.report || options.analyze) ? 'server' : 'disabled',
                    reportFilename: `${bundleName}report.html`,
                    statsFilename: `${bundleName}report.json`,
                    generateStatsFile: !!args['report-json'],
                }));
            });
        }

        return new Promise((resolve, reject) => {
            // Delete contents of output directory
            // Object.keys(api.artifex.paths.output).forEach(key => {
            //     fs.removeSync(api.artifex.paths.output[key]);
            // });

            fs.removeSync(api.artifex.paths.root);

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

                const targetDirShort = path.relative(
                    api.artifex.context,
                    targetDir,
                );

                const message = args.watch
                    ? `Build complete. Watching for changes...\n\n`
                    : `Compiled successfully in ${stats.endTime - stats.startTime}ms\n\n`

                clearConsole();
                done(chalk.green(message));
                log(formatStats(stats, targetDirShort, api));

                if (api.artifex.mode === 'production') {
                    done(`Build complete.\n`);
                }

                resolve();
            });
        });
    });
};
