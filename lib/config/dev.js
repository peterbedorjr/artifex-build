module.exports = (api, options) => {
    api.chainWebpack((config) => {
        if (api.artifex.isInDevelopment()) {
            config.devtool('eval');
        }
    });
}
