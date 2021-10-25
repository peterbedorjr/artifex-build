const path = require('path');

const { log } = require('../../utils/log');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        config.module
            .rule('vue')
            .test(/\.vue$/)
                .use('vue')
                .loader('vue-loader')
                .options({
                    loaders: [{ loader: 'babel-loader' }]
                });


        config.plugin('vue-loader')
            .use(require('vue-loader/lib/plugin'))
            .end();
    });
};
