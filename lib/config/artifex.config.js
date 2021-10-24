module.exports = () => ({
    // Application name
    appName: 'Artifex',

    // Public Path
    // https://webpack.js.org/guides/public-path/#root
    publicPath: '/assets',

    // Paths
    paths: {
        root: 'public',
        source: {
            root: 'source',
            scripts: 'scripts',
            styles: 'styles',
            fonts: 'fonts',
            images: 'images',
            static: 'static',
            components: 'components',
            pages: 'pages',
        },
        output: {
            root: 'assets',
            scripts: 'scripts',
            styles: 'styles',
            fonts: 'fonts',
            images: 'images',
        },
    },

    // Any styles that need to be made globally available.
    // This wil inject the css content into each process file,
    // so it's generally advised to only include mixins or variables.
    // Relative to project root
    // https://github.com/shakacode/sass-resources-loader
    sharedStyles: [
        'source/styles/_variables.scss',
        'source/styles/_mixins.scss',
    ],

    script: {
        entry: {
            app: 'app.js',
        },

        // Webpack output
        // https://webpack.js.org/concepts/output/#usage
        output: {
            filename: '[name].js',
            chunkFilename: '[name].chunk.js',
        }
    },

    style: {
        entry: {
            app: 'app.scss',
        },

        // Webpack output
        // https://webpack.js.org/concepts/output/#usage
        output: {
            filename: '[name].css',
            chunkFilename: '[name].chunk.css',
        },

        // Each breakpoint defined in this configuration block will register
        // a min-width media query in your stylesheet output.
        // Each breakpoint can be referenced by their key name.
        breakpoints: {
            mobileLandscape: 480,
            tablet: 768,
            desktop: 1024,
            desktop2: 1280,
            desktop3: 1440,
        },

        // Intended to account for browsers that push content over to
        // make room for the vertical scrollbar. Each breakpoint value
        // will have this value subtracted from it before generating
        // the media query in output stylesheets.
        breakpointOffset: 25,

        // Breakpoint offset file generation path
        // relative to the styles source directory
        breakpointOutputDir: 'temp',

        // Fix stylelint errors
        fix: false,
    },

    // HTML Webpack plugin
    // https://github.com/jantimon/html-webpack-plugin
    //
    // Name of the template relative to `source` directory
    // or object of configuration options for the plugin
    html: 'index.html',

    // Copy Webpack Plugin
    // https://webpack.js.org/plugins/copy-webpack-plugin/
    //
    // Copy files using an array of objects:
    // { from: "source", to: "dest" }
    // `from` is relative to project root and `to` is
    // relative to `public`
    // set to `false` to completely disable
    copy: [],

    // Favicon Generation
    // https://github.com/jantimon/favicons-webpack-plugin
    //
    // The name of the file to use in favicon generation, relative to
    // the configuration path for `images`
    favicon: 'logo.svg',

    // Split chunks
    // https://webpack.js.org/plugins/split-chunks-plugin/
    chunking: true,

    // Terser
    // https://webpack.js.org/plugins/terser-webpack-plugin/
    terser: {},
});
