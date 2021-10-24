const genTerserOptions = (defaultOptions, options) => {
    const userOptions = options.terser && options.terser.terserOptions
    // user's config is first
    return {
        ...defaultOptions,
        ...userOptions
    }
}

const terserMinify = (options) => ({
    terserOptions: genTerserOptions(
        {
            compress: {
                // turn off flags with small gains to speed up minification
                arrows: false,
                collapse_vars: false, // 0.3kb
                comparisons: false,
                computed_props: false,
                hoist_funs: false,
                hoist_props: false,
                hoist_vars: false,
                inline: false,
                loops: false,
                negate_iife: false,
                properties: false,
                reduce_funcs: false,
                reduce_vars: false,
                switches: false,
                toplevel: false,
                typeofs: false,

                // a few flags with noticeable gains/speed ratio
                // numbers based on out of the box vendor bundle
                booleans: true, // 0.7kb
                if_return: true, // 0.4kb
                sequences: true, // 0.7kb
                unused: true, // 2.3kb

                // required features to drop conditional branches
                conditionals: true,
                dead_code: true,
                evaluate: true,
            },
            mangle: {
                safari10: true,
            },
        },
        options,
    ),
    parallel: options.parallel,
    extractComments: {
        condition: /^\**!|@preserve|@license|@cc_on/i,
        filename: (file) => {
            return file.filename.replace(/\.(\w+)($|\?)/, '.$1.LICENSE.txt$2');
        },
        banner: (licenseFile) => {
            return `License information can be found in ${licenseFile}`;
        },
    }
});

module.exports = terserMinify
