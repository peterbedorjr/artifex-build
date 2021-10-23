module.exports = (api, options) => {
    api.chainWebpack((config) => {
        config.module
            .rule('js')
            .test(/\.js$/)
                .exclude
                    .add(/node_modules/)
                    .end()
                .use('babel-loader')
                    .loader(require.resolve('babel-loader'))
                    .end();
        });
    }
