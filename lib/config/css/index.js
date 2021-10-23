const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ResponsiveWebpackPlugin = require('../../plugins/ResponsiveWebpackPlugin');

module.exports = (api, options) => {
    api.chainWebpack(config => {
        const re = /\.s?css$/;

        // Extract
        config.module
            .rule('extract-css')
            .test(re)
            .use('extract-css-loader')
            .loader(MiniCssExtractPlugin.loader)
            .end();

        // CSS loader
        config.module
            .rule('css')
            .test(re)
            .use('css-loader')
            .loader(require.resolve('css-loader'))
            .options({
                url: false,
            })
            .end();

        // Postcss loader
        const postcssConfig = api.resolveConfigFile('postcss')
            ? api.resolveConfigFile('postcss') 
            : path.resolve(__dirname, 'postcss.config.js');
        
        config.module
            .rule('postcss')
            .test(re)
            .use('postcss-loader')
            .loader(require.resolve('postcss-loader'))
            .options({
                postcssOptions: {
                    config: postcssConfig,
                },
            })
            .end();

        // Sass loader
        config.module
            .rule('sass')
            .test(re)
            .use('sass-loader')
            .loader(require.resolve('sass-loader'))
            .end();

        config.module
            .rule('sass-resources')
            .test(re)
            .use('sass-resources-loader')
            .loader(require.resolve('sass-resources-loader'))
            .options({
                resources: [
                    api.resolve('source/styles/_variables.scss'),
                    api.resolve('source/styles/_mixins.scss'),
                ],
            })
            .end();

        // Extract css
        config.plugin('extract-css')
            .use(MiniCssExtractPlugin, [{
                filename: path.join('../styles', options.style.output.filename),
                chunkFilename: path.join('../styles', options.style.output.chunkFilename),
            }])
            .end();

        // Responsive mixins
        config.plugin('responsive-css')
            .use(ResponsiveWebpackPlugin, [{
                breakpoints: options.style.breakpoints,
                offset: options.style.breakpointOffset,
                output: 'temp',
                context: path.resolve(__dirname, '../../../'),
            }]);
    });
}
