const defaultsDeep = require('lodash.defaultsdeep');

const is = require('../../utils/is');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        if (api.isInProduction() && api.optionEnabled(options.chunking)) {
            config
                .optimization.splitChunks(defaultsDeep({
                    cacheGroups: {
                        defaultVendors: {
                            name: 'scripts/chunk-vendors',
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10,
                            chunks: 'initial'
                        },
                        common: {
                            name: 'scripts/chunk-common',
                            minChunks: 2,
                            priority: -20,
                            chunks: 'initial',
                            reuseExistingChunk: true
                        }
                    }
                }, is.object(options.chunking) ? options.chunking : {}));
        }
    });
}
