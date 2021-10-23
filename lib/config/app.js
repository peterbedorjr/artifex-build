const defaultsDeep = require('lodash.defaultsdeep');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        config.output.pathinfo(true);

        if (api.optionEnabled(options.manifest)) {
            const manifestName = options.manifest.fileName ?
                options.manifest.fileName : 'assets.json';

            config.plugin('manifest')
                .use(WebpackManifestPlugin, [defaultsDeep({
                    publicPath: '',
                    fileName: `../../${manifestName}`,
                    map: (file) => ({
                        ...file,
                        path: file.path.replace('../styles/', ''),
                    }),
                    // Filter out anything that isn't css, js or source map
                    filter: (file) => {
                        const entries = options.style.entry;
                        const styleEntries = [];

                        // While we are suppresing the js file created by webpack
                        // for the CSS only entry points, the manifest still includes
                        // them so we must filter them out.
                        Object.keys(entries).forEach((entry) => {
                            styleEntries.push(...[
                                entries[entry].replace('css', 'js'),
                                entries[entry].replace('css', 'js.map'),
                            ]);
                        });

                        return /\.(css|js|map)$/gi.test(file.name)
                            && !styleEntries.includes(file.name);
                    },
                }, options.manifest)]);
        }

        // code splitting
        if (api.artifex.isInProduction() && api.optionEnabled(options.chunking)) {
            config
                .optimization.splitChunks(defaultsDeep({
                    chunks: 'async',
                    minSize: 10000,
                    minRemainingSize: 0,
                    minChunks: 1,
                    maxAsyncRequests: 30,
                    maxInitialRequests: 30,
                    enforceSizeThreshold: 50000,
                    cacheGroups: {
                        defaultVendors: {
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10,
                            reuseExistingChunk: true,
                        },
                        default: {
                            minChunks: 2,
                            priority: -20,
                            reuseExistingChunk: true,
                        },
                    },
                }, (typeof options.chunking === 'object' ? options.chunking : {}) || {}));
        }

        // TODO
        // Do not generate js chunks from css only entries
        // config.plugin('suppress-chunks')
        //     .use(
        //         require('suppress-chunks-webpack-plugin').default,
        //         [Object.keys(options.style.entry).map(name => ({ name, match: /\.(js|js.map)$/ }))]
        //     )
        //     .end();
    });
}
