exports.defaults = () => ({
    // Application name
    appName: 'Artifex',

    // The paths for the project relative to the project root
    paths: {
        root: 'public',
        assets: 'assets',
        source: 'source',
        components: 'source/components',
    },
    script: {
        // Webpack entry points
        // https://webpack.js.org/concepts/entry-points/
        //
        // Each key is the chunk name while the value is the file
        // relative to the source/scripts directory. You may
        // also set the value to an array of files to bundle them
        // together
        entry: {
            app: 'app.js',
        },

        // Webpack output
        // https://webpack.js.org/concepts/output/#usage
        output: {
            filename: '[name].js',
            chunkFilename: '[name].chunk.js',
        },
    },

    // Webpack manifest plugin
    // https://github.com/danethurber/webpack-manifest-plugin#api
    manifest: {
        fileName: 'assets.json',
    },

    // Webpack split chunks plugin
    // https://webpack.js.org/plugins/split-chunks-plugin/
    //
    // If set to true, the build process will use some common defaults
    // for vendor and common chunks. If set to an object, that object
    // will override any defaults
    chunking: true,
    style: {
        // Webpack entry points
        // https://webpack.js.org/concepts/entry-points/
        //
        // Each key is the chunk name while the value is the file
        // relative to the source/scripts directory. You may
        // also set the value to an array of files to bundle them
        // together
        entry: {},

        // Webpack output
        // https://webpack.js.org/concepts/output/#usage
        output: {
            filename: '[name].css',
            chunkFilename: '[name].chunk.css',
        },

        breakpoints: {
            mobileLandscape: 480,
            tablet: 768,
            desktop: 1024,
            desktop2: 1280,
            desktop3: 1440,
        },
        breakpointOffset: 25,
    },

    // Purgecss
    // https://www.purgecss.com/with-webpack
    //
    // Accepts an object with a key of paths. These paths can
    // be glob patterns
    purgeCss: false,

    // Analyze the webpack bundle
    // You can also pass --repot to the build command
    // https://github.com/webpack-contrib/webpack-bundle-analyzer#usage-as-a-plugin
    analyze: false,

    // Any raw webpack config overrides or additions can go in here.
    // These get merged in at the end and will override previous or
    // default configuration
    configureWebpack: {},

    // Chain Webpack
    // https://github.com/neutrinojs/webpack-chain/tree/v5
    //
    // Modify the webpack config through chain webpack
    chainWebpack: (config) => { },

    // Browser Sync
    // https://www.browsersync.io/
    // https://github.com/Va1/browser-sync-webpack-plugin#usage
    server: {
        ghostMode: false,
        host: 'auto',
        port: 9000,
        https: true,
        proxy: 'https://artifex.test',
        static: true,
        reload: {
            enable: true,
            watch: {
                root: true,
                paths: [],
                extensions: [
                    'html',
                ],
                ignore: [],
            },
        },
    },
});