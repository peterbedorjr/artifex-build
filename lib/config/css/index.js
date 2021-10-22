const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');



module.exports = (api, options) => {
    api.chainWebpack(config => {
        const re = /\.s?css$/;
        const userConfigFile = api.artifex.resolveConfigFile('postcssrc');
        let configPath = userConfigFile 
            ? api.artifex.context 
            : path.resolve(__dirname);

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
            .loader('css-loader')
            .options({
                url: false,
            })
            .end();

        // Postcss loader
        config.module
            .rule('postcss')
            .test(re)
            .use('postcss-loader')
            .loader('postcss-loader')
            .end();

        // Sass loader
        config.module
            .rule('sass')
            .test(re)
            .use('sass-loader')
            .loader('sass-loader')
            .end();

        config.module
            .rule('sass-resources')
            .test(re)
            .use('sass-resources-loader')
            .loader('sass-resources-loader')
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
    });
}
