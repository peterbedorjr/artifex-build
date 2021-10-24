const defaults = require('lodash.defaultsdeep');

const is = require('../../utils/is');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const ignore = [
            '.gitkeep',
            '.DS_Store',
        ];

        const globOptions = { ignore };

        if (options.copy !== false) {
            const defaults = {
                patterns: [
                    {
                        from: api.resolveSourcePath(options.paths.source.images),
                        to: api.resolveOutputPath(options.paths.output.images),
                        globOptions,
                    },
                    {
                        from: api.resolveSourcePath(options.paths.source.static),
                        to: api.resolve(options.paths.root),
                        globOptions,
                    },
                    {
                        from: api.resolveSourcePath(options.paths.source.fonts),
                        to: api.resolveOutputPath(options.paths.output.fonts),
                        globOptions,
                    },
                ],
                options: {
                    concurrency: 100,
                },
            };

            if (is.array(options.copy)) {
                defaults.patterns = [
                    ...defaults.patterns,
                    ...options.copy,
                ];
            }

            // Copy fonts and images and whatever else is in the
            // user config
            config.plugin('copy-webpack')
                .use(require('copy-webpack-plugin'), [defaults]);
        }
    });
}
