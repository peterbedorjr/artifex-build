const defaults = require('lodash.defaultsdeep');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const is = require('../../utils/is');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        if (api.optionEnabled(options.manifest)) {
            const fileName = options.manifest.filename ?
                options.manifest.filename : 'assets.json';

            const pluginConfig = defaults({
                basePath: '/assets/',
                publicPath: '/assets/',
                fileName: `../${fileName}`,
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

                    return /\.(css|js)$/gi.test(file.name)
                        && !styleEntries.includes(file.name);
                },
            }, is.object(options.manifest) ? options.manifest : {});

            config.plugin('manifest')
                .use(WebpackManifestPlugin, [pluginConfig]);
        }
    });
}
