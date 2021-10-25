const WebpackBar = require('webpackbar');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        config.plugin('progress')
            .use(WebpackBar);
    });
};
