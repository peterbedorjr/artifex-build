const path = require('path');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        config
            .mode(api.artifex.mode)
            .context(api.artifex.context);

        config.resolve
            .set('symlinks', false)
                .extensions
                    .merge(['.js', '.jsx', '.vue', '.json'])
                    .end()
                .modules
                    .add(path.resolve(__dirname, '../../node_modules'))
                    .add(api.resolve('node_modules'))
                    .end();

        config.resolveLoader
            .modules
                .add(path.resolve(__dirname, '../../node_modules'))
                .add(api.resolve('node_modules'))
                .end();
    });
};
