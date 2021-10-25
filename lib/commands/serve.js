module.exports = (api, options) => {
    api.registerCommand('serve', async (args) => {
        if (args.server === 'browser-sync') {
            const webpack = require('webpack');
            const { info, clearConsole } = require('../../utils/log');

            let webpackConfig = api.resolveChainableWebpackConfig().toConfig();

            clearConsole();
            info('Starting development server...');

            return new Promise(async (resolve, reject) => {
                webpack(webpackConfig, (err) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve();
                });
            });
        }
        // TODO Webpack dev server
        // const webpack = require('webpack');
        // const DevServer = require('webpack-dev-server');
        // const portfinder = require('portfinder');

        // const defaults = {
        //     host: '0.0.0.0',
        //     port: 8080,
        //     https: false,
        // }
        // // Remove progress plugin
        // api.chainWebpack((config) => {
        //     config.plugins.delete('progress');

        //     config.target('web');
        // });

        // const webpackConfig = api.resolveWebpackConfig();

        // webpackConfig.watch = true;

        // return new Promise(async (resolve, reject) => {
        //     const compiler = webpack(webpackConfig, (err) => {
        //         if (err) {
        //             return reject(err);
        //         }

        //         resolve();
        //     });

        //     const projectDevServerOptions = Object.assign(
        //         webpackConfig.devServer || {},
        //         options.devServer,
        //     );

        //     const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host;
        //     portfinder.basePort = args.port || process.env.PORT || projectDevServerOptions.port || defaults.port;
        //     const port = await portfinder.getPortPromise();

        //     const server = new DevServer({
        //         host,
        //         port,
        //         client: {
        //             logging: 'none',
        //         },
        //         watchFiles: true,
        //         // webSocketServer: 'ws',
        //         watchFiles: {
        //             options: {
        //                 usePolling: false,
        //             },
        //             paths: [
        //                 `${api.resolve(options.paths.root)}/**/*`,
        //                 `${api.resolve(options.paths.source.root)}/**/*`,
        //             ],
        //         },
        //         hot: !api.isInProduction(),
        //         ...projectDevServerOptions,
        //     }, compiler);

        //     server.start();
        // });
    });
};
