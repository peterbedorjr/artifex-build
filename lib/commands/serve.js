const defaults = {
    host: '0.0.0.0',
    port: 8080,
    https: false,
};

module.exports = (api, options) => {
    const webpack = require('webpack');
    const portfinder = require('portfinder');
    const WebpackDevServer = require('webpack-dev-server');
    const prepareURLs = require('../utils/prepareURLs');
    const prepareProxy = require('../utils/prepareProxy');
    const isAbsoluteUrl = require('../utils/isAbsoluteUrl');
    const { info, clearConsole } = require('../utils/log');
    
    const isInContainer = checkInContainer();

    api.registerCommand('serve', async (args) => {
        // const webpack = require('webpack');
        const { info, clearConsole } = require('../utils/log');

        // let webpackConfig = api.resolveChainableWebpackConfig().toConfig();

        // clearConsole();
        // info('Starting development server...');

        // return new Promise(async (resolve, reject) => {
        //     webpack(webpackConfig, (err) => {
        //         if (err) {
        //             return reject(err);
        //         }

        //         resolve();
        //     });
        // });

        info('Starting development server...');

        // configs that only matters for dev server
        api.chainWebpack(async (webpackConfig) => {
            if (!api.artifex.isInProduction()) {
                if (!webpackConfig.get('devtool')) {
                    webpackConfig
                        .devtool('eval-cheap-module-source-map');
                }

                // https://github.com/webpack/webpack/issues/6642
                // https://github.com/vuejs/vue-cli/issues/3539
                webpackConfig
                    .output
                    .globalObject(`(typeof self !== 'undefined' ? self : this)`);
            }
        });

        // TODO
        // if (!process.env.VUE_CLI_TEST && options.devServer.progress !== false) {
        //     // the default progress plugin won't show progress due to infrastructreLogging.level
        //     webpackConfig
        //         .plugin('progress')
        //         .use(require('progress-webpack-plugin'))
        // }

        // resolve webpack config
        const webpackConfig = api.resolveWebpackConfig();

        // load user devServer options with higher priority than devServer
        // in webpack config
        const projectDevServerOptions = Object.assign(
            webpackConfig.devServer || {},
            options.devServer
        )

        // resolve server options
        const useHttps = args.https || projectDevServerOptions.https || defaults.https;
        const protocol = useHttps ? 'https' : 'http';
        const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host;
        portfinder.basePort = args.port || process.env.PORT || projectDevServerOptions.port || defaults.port;
        const port = await portfinder.getPortPromise();
        const rawPublicUrl = args.public || projectDevServerOptions.public;
        const publicUrl = rawPublicUrl
            ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
                ? rawPublicUrl
                : `${protocol}://${rawPublicUrl}`
            : null;
        const publicHost = publicUrl ? /^[a-zA-Z]+:\/\/([^/?#]+)/.exec(publicUrl)[1] : undefined;

        const urls = prepareURLs(
            protocol,
            host,
            port,
            isAbsoluteUrl(options.publicPath) ? '/' : options.publicPath
        );
        const localUrlForBrowser = publicUrl || urls.localUrlForBrowser;

        const proxySettings = prepareProxy(
            projectDevServerOptions.proxy,
            api.resolve('public')
        );

        // inject dev & hot-reload middleware entries
        let webSocketURL;

        if (!api.artifex.isInProduction()) {
            if (publicHost) {
                // explicitly configured via devServer.public
                webSocketURL = {
                    protocol: protocol === 'https' ? 'wss' : 'ws',
                    hostname: publicHost,
                    port,
                };
            } else if (isInContainer) {
                // can't infer public network url if inside a container
                // infer it from the browser instead
                webSocketURL = 'auto://0.0.0.0:0/ws';
            } else {
                // otherwise infer the url from the config
                webSocketURL = {
                    protocol: protocol === 'https' ? 'wss' : 'ws',
                    hostname: urls.lanUrlForConfig || 'localhost',
                    port,
                }
            }
        }

        // fixme: temporary fix to suppress dev server logging
        // should be more robust to show necessary info but not duplicate errors
        webpackConfig.infrastructureLogging = { ...webpackConfig.infrastructureLogging, level: 'none' };
        webpackConfig.stats = 'errors-only';

        const compiler = webpack(webpackConfig);

        // create server
        const server = new WebpackDevServer(Object.assign({
            historyApiFallback: {
                disableDotRule: true,
                htmlAcceptHeaders: [
                    'text/html',
                    'application/xhtml+xml'
                ],
                rewrites: genHistoryApiFallbackRewrites(api.artifex.paths.root, options.pages)
                // rewrites: genHistoryApiFallbackRewrites(options.publicPath, options.pages) // TODO
            },
            hot: !api.artifex.isInProduction()
        }, projectDevServerOptions, {
            host,
            port,
            https: useHttps,
            proxy: proxySettings,

            static: {
                directory: api.resolve('public'),
                publicPath: options.publicPath,
                watch: !api.artifex.isInProduction(),

                ...projectDevServerOptions.static
            },

            client: {
                webSocketURL,

                logging: 'none',
                overlay: api.artifex.isInProduction() // TODO disable this
                    ? false
                    : { warnings: false, errors: true },
                progress: !process.env.VUE_CLI_TEST,

                ...projectDevServerOptions.client
            },

            open: args.open || projectDevServerOptions.open,
            setupExitSignals: true,

            // eslint-disable-next-line no-shadow
            onBeforeSetupMiddleware(server) {
                // TODO
                // allow other plugins to register middlewares, e.g. PWA
                // todo: migrate to the new API interface
                // api.artifex.devServerConfigFns.forEach(fn => fn(server.app, server))

                if (projectDevServerOptions.onBeforeSetupMiddleware) {
                    projectDevServerOptions.onBeforeSetupMiddleware(server)
                }
            }
        }), compiler);

        if (args.stdin) {
            process.stdin.on('end', () => {
                server.stopCallback(() => {
                    process.exit(0)
                })
            });

            process.stdin.resume();
        }

        return new Promise((resolve, reject) => {
            // log instructions & open browser on first compilation complete
            let isFirstCompile = true
            compiler.hooks.done.tap('artifex serve', (stats) => {
                if (stats.hasErrors()) {
                    return;
                }

                let copied = '';
                if (isFirstCompile && args.copy) {
                    try {
                        require('clipboardy').writeSync(localUrlForBrowser)
                        copied = chalk.dim('(copied to clipboard)')
                    } catch (_) {
                        /* catch exception if copy to clipboard isn't supported (e.g. WSL), see issue #3476 */
                    }
                }

                const networkUrl = publicUrl
                    ? publicUrl.replace(/([^/])$/, '$1/')
                    : urls.lanUrlForTerminal

                console.log()
                console.log(`  App running at:`)
                console.log(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)} ${copied}`)
                if (!isInContainer) {
                    console.log(`  - Network: ${chalk.cyan(networkUrl)}`)
                } else {
                    console.log()
                    console.log(chalk.yellow(`  It seems you are running Vue CLI inside a container.`))
                    if (!publicUrl && options.publicPath && options.publicPath !== '/') {
                        console.log()
                        console.log(chalk.yellow(`  Since you are using a non-root publicPath, the hot-reload socket`))
                        console.log(chalk.yellow(`  will not be able to infer the correct URL to connect. You should`))
                        console.log(chalk.yellow(`  explicitly specify the URL via ${chalk.blue(`devServer.public`)}.`))
                        console.log()
                    }
                    console.log(chalk.yellow(`  Access the dev server via ${chalk.cyan(
                        `${protocol}://localhost:<your container's external mapped port>${options.publicPath}`
                    )}`))
                }
                console.log()

                if (isFirstCompile) {
                    isFirstCompile = false

                    if (!api.artifex.isInProduction()) {
                        const buildCommand = hasProjectYarn(api.getCwd()) ? `yarn build` : hasProjectPnpm(api.getCwd()) ? `pnpm run build` : `npm run build`
                        console.log(`  Note that the development build is not optimized.`)
                        console.log(`  To create a production build, run ${chalk.cyan(buildCommand)}.`)
                    } else {
                        console.log(`  App is served in production mode.`)
                        console.log(`  Note this is for preview or E2E testing only.`)
                    }
                    console.log()

                    // Send final app URL
                    if (args.dashboard) {
                        const ipc = new IpcMessenger();

                        ipc.send({
                            vueServe: {
                                url: localUrlForBrowser
                            }
                        });
                    }

                    // resolve returned Promise
                    // so other commands can do api.service.run('serve').then(...)
                    resolve({
                        server,
                        url: localUrlForBrowser,
                    });
                }
            });

            server.start().catch(err => reject(err));
        });
    });
};

function genHistoryApiFallbackRewrites(baseUrl, pages = {}) {
    const path = require('path');
    const multiPageRewrites = Object
        .keys(pages)
        // sort by length in reversed order to avoid overrides
        // eg. 'page11' should appear in front of 'page1'
        .sort((a, b) => b.length - a.length)
        .map((name) => ({
            from: new RegExp(`^/${name}`),
            to: path.posix.join(baseUrl, pages[name].filename || `${name}.html`)
        }))
    return [
        ...multiPageRewrites,
        { from: /./, to: path.posix.join(baseUrl, 'index.html') }
    ]
}

// https://stackoverflow.com/a/20012536
function checkInContainer () {
    if ('CODESANDBOX_SSE' in process.env) {
      return true
    }
    const fs = require('fs')
    if (fs.existsSync(`/proc/1/cgroup`)) {
      const content = fs.readFileSync(`/proc/1/cgroup`, 'utf-8')
      return /:\/(lxc|docker|kubepods(\.slice)?)\//.test(content)
    }
  }