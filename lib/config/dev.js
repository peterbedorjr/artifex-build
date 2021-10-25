module.exports = (api, options) => {
    api.chainWebpack((config) => {
        if (api.isInDevelopment()) {
            config.devtool('eval');
        }
    });
}
