const path = require('path');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        // Favicon generation
        config.plugin('favicons')
            .use(FaviconsWebpackPlugin, [{
                logo: path.resolve(api.artifex.paths.images, options.favicon),
                cache: true,
                // outputPath: api.artifex.paths.output.images,
                // publicPath: '/assets/images',
                android: false,
                appleIcon: false,
                appleStartup: false,
                coast: false,
                favicons: true,
                firefox: false,
                windows: false,
                yandex: false,
            }]);
    });
}
