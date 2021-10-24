const defaults = require('lodash.defaultsdeep');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const is = require('../../utils/is');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        if (api.optionEnabled(options.favicon)) {
            let conf = {
                cache: true,
                outputPath: api.resolveOutputPath('../'),
                prefix: '/',
            };

            if (is.object(options.favicon)) {
                conf = defaults(conf, options.favicon);
            } else {
                conf = defaults(conf, options.favicon, {
                    logo: api.resolveSourcePath(options.paths.source.images, options.favicon),
                });
            }

            // Favicon generation
            config.plugin('favicons')
                .use(FaviconsWebpackPlugin, [conf]);
        }
    });
}
