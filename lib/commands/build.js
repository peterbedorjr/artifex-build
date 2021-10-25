const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const chalk = require('chalk');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const { log, done, clearConsole, error } = require('../../utils/log');
const formatStats = require('../../utils/format-stats');

const modifyConfig = (config, fn) => {
    if (Array.isArray(config)) {
        config.forEach(c => fn(c));
    } else {
        fn(config);
    }
};

module.exports = (api, options) => {
    api.registerCommand('build', async (args) => {
        const targetDir = api.resolve(args.dest || path.resolve(options.paths.root, options.paths.output.root));
        const { mode } = api.artifex;

        // If silent flag is true, or we're analyzing bundle speed
        // don't output progress bar as it doesn't work so good
        // right now
        if (args.silent || (options.analyze.speed || args['report-speed'])) {
            api.chainWebpack((config) => {
                config.plugins.delete('progress');
            });
        }

        if (!args.silent) {
            clearConsole();
            log(`Building for ${api.artifex.staging ? 'staging' : mode}...`);
        }

        let webpackConfig = api.resolveWebpackConfig();

        if (options.analyze.size || (args['report-size'] || args['report-json'])) {
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

            modifyConfig(webpackConfig, (config) => {
                config.plugins.push(new BundleAnalyzerPlugin({
                    logLevel: 'warn',
                    openAnalyzer: true,
                    analyzerMode: args['report-speed'] ? 'static' : 'disabled',
                    reportFilename: 'report.html',
                    statsFilename: 'report.json',
                    generateStatsFile: !!args['report-json'],
                }));
            });
        }

        if (options.analyze.speed || args['report-speed']) {
            const smp = new SpeedMeasurePlugin({
                outputFormat: 'human',
            });

            webpackConfig = smp.wrap(webpackConfig);
        }

        return new Promise((resolve, reject) => {
            // Delete contents of output directory
            fs.removeSync(api.resolve('public'));

            webpack(webpackConfig, (err, stats) => {
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

                if (options.analyze.speed || args['report-speed']) {
                    clearConsole();

                    return resolve(stats);
                }

                if (! args.silent) {
                    const message = args.watch
                        ? `Build complete. Watching for changes...\n\n`
                        : `Compiled successfully in ${stats.endTime - stats.startTime}ms\n\n`

                    clearConsole();
                    done(chalk.green(message));
                    log(formatStats(stats, targetDir, api));

                    if (api.artifex.mode === 'production') {
                        done(`Build complete.\n`);
                    }
                }

                resolve();
            });
        });
    });
};
