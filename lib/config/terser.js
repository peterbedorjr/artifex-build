const TerserPlugin = require('terser-webpack-plugin')

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const terserOptions = require('./terser-options');

        config.optimization
            .nodeEnv(api.artifex.mode)
            .minimizer('terser')
            .use(TerserPlugin, [terserOptions(options)])
    });
}
