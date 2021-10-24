const path = require('path');
const defaults = require('lodash.defaultsdeep');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

const ResponsiveWebpackPlugin = require('../../../plugins/ResponsiveWebpackPlugin');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
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

        if (options.sharedStyles && options.sharedStyles.length) {
            const resources = options.sharedStyles;

            config.module
                .rule('sass-resources')
                .test(re)
                .use('sass-resources-loader')
                .loader(require.resolve('sass-resources-loader'))
                .options({ resources })
                .end();
        }

        // Extract css
        config.plugin('extract-css')
            .use(MiniCssExtractPlugin, [{
                filename: options.style.output.filename,
                chunkFilename: options.style.output.chunkFilename,
            }])
            .end();

        // Responsive mixins
        if (Object.keys(options.style.breakpoints).length) {
            const responsiveCssConfig = defaults({
                breakpoints: options.style.breakpoints,
                offset: options.style.breakpointOffset || 0,
                output: 'temp',
                context: path.resolve(__dirname, '../../../'),
            }, {
                output: options.style.breakpoints.breakpointOutputDir || null,
                context: api.resolve(options.paths.source.root, options.paths.source.styles),
            });

            config.plugin('responsive-css')
                .use(ResponsiveWebpackPlugin, [responsiveCssConfig]);
        }

        config.plugin('remove-empty-scripts')
            .use(RemoveEmptyScriptsPlugin);
    });
}
