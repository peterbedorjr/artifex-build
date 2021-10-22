module.exports = () => ({
    plugins: [
        require('autoprefixer')({
            grid: true,
        }),
        require('postcss-preset-env'),
        require('postcss-combine-media-query')(),
        require('cssnano')({
            safe: true,
            preset: ['default', {
                calc: false,
            }],
        }),
    ],
});
