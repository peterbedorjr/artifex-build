const chalk = require('chalk');
const { log, error, clearConsole } = require('../../utils/log');

function logUrls(urls, options) {
    clearConsole();
    log([
    `  ${chalk.bold(`${options.appName} running at:`)}`,
    `   - Local: ${chalk.cyan(urls.get('local'))}`,
    `   - Network: ${chalk.cyan(urls.get('external'))}`,
    `   - UI: ${chalk.cyan(urls.get('ui'))}`
    ].join('\n'));
    log();
}

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        config.watch(true);

        config
            .plugin('browser-sync')
            .use(require('browser-sync-webpack-plugin'), [{
                host: options.browserSync.host === 'auto' ? null : options.browserSync.host,
                port: options.browserSync.port,
                ui: {
                    port: options.browserSync.port + 1,
                    weinre: {
                        port: options.browserSync.port + 100,
                    },
                },
                logLevel: 'silent',
                open: 'external',
                https: options.browserSync.https,
                server: options.browserSync.static ? api.resolve(options.paths.root) : false,
                proxy: options.browserSync.static ? false : options.browserSync.proxy,
                logPrefix: 'Wee',
                logFileChanges: true,
            }, {
                callback(err, bs) {
                    if (err) {
                        error(err);
                    }

                    logUrls(bs.options.get('urls'), options);

                    bs.emitter.on('browser:reload', () => {
                        log();
                        logUrls(bs.options.get('urls'), options);
                    });
                }
            }]);
    });
};
