const TerserPlugin = require.resolve('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        if (api.isInProduction()) {
            config.devtool('source-map');

            // keep module.id stable when vendor modules does not change
            config
                .plugin('hash-module-ids')
                .use(webpack.ids.HashedModuleIdsPlugin)
                .end();

            // TODO
            // const imageminMozjpeg = require('imagemin-mozjpeg');
            // config.plugin('imagemin')
            //     .use(require('imagemin-webpack-plugin').default, [{
            //         test: /\.(jpe?g|png|gif|svg)$/i,
            //         plugins: [
            //             imageminMozjpeg({
            //                 quality: 99,
            //                 progressive: true
            //             }),
            //         ],
            //         pngquant: {
            //             quality: '99',
            //             test: /\.(jpe?g|png|gif|svg)$/i,
            //         },
            //     }]);
        }
    });
}
