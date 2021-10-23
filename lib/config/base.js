module.exports = (api, options) => {
    /**
     * Process the entries from the wee.config.js into something
     * chain webpack can consume
     *
     * @param {Config} config - the config object
     * @param {Object} entries - the object of entries to process
     * @param {String} type - the type of entries, e.g. 'styles' or 'scripts'
     */
    const resolveEntries = (config, entries, type) => {
        Object.keys(entries).forEach((key) => {
            const files = entries[key];
            const entryConfig = config.entry(key);
            const path = api.artifex.paths[type];

            if (Array.isArray(files)) {
                files.forEach(entry => entryConfig.add(`${path}/${entry}`));
            } else {
                entryConfig.add(`${path}/${files}`);
            }
        });
    }

    api.chainWebpack(config => {
        config
            .mode(api.artifex.mode)
            .context(api.artifex.context);

        // Add entries from the project options
        resolveEntries(config, options.script.entry, 'scripts');
        resolveEntries(config, options.style.entry, 'styles');

        config.resolve
            .set('symlinks', false)
                .extensions
                    .merge(['.js', '.jsx', '.vue', '.json'])
                    .end()
                .modules
                    .add('node_modules')
                    .add(api.resolve('node_modules'))
                    .end();

        config.resolveLoader
            .modules
                .add('node_modules')
                .add(api.resolve('node_modules'))
                .end();

        config.module
            .rule('vue')
            .test(/\.vue$/)
                .use('vue')
                .loader('vue-loader')
                .options({ loaders: [{ loader: 'babel-loader' }] });


        config.plugin('vue-loader')
            .use(require('vue-loader/lib/plugin'))
            .end();

        // Define ENV
        config.plugin('define')
            .use(require('webpack/lib/DefinePlugin'), [{
                'process.env': api.artifex.mode,
            }])
            .end();

        // Set the output options
        config.output
            .path(api.artifex.paths.output.scripts)
            .publicPath(`/${options.paths.assets}/scripts/`)
            .filename(options.script.output.filename)
            .chunkFilename(options.script.output.chunkFilename);
    });
};