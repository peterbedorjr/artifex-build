module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const outputConfig = config.output
            .path(api.resolveOutputPath('.'))
            .filename(options.script.output.filename)
            .chunkFilename(options.script.output.chunkFilename)
            .pathinfo(true);

        if (options.publicPath) {
            outputConfig.publicPath(options.publicPath);
        }
    });
};
