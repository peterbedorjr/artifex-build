module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const ignore = [
            '.gitkeep',
            '.DS_Store',
        ];

        // Copy fonts and images
        config.plugin('copy-webpack')
            .use(require('copy-webpack-plugin'), [{
                patterns: [
                    { from: api.artifex.paths.images, to: api.artifex.paths.output.images, globOptions: { ignore } },
                    { from: api.artifex.paths.static, to: api.artifex.paths.root, globOptions: { ignore } },
                    { from: api.artifex.paths.fonts, to: api.artifex.paths.output.fonts, globOptions: { ignore } },
                ],
                options: {
                    concurrency: 100,
                },
            }]);
    });
}
