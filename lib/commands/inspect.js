module.exports = (api, options) => {
    api.registerCommand('inspect', (args) => {
        process.stdout.write(JSON.stringify(api.resolveWebpackConfig(), null, 4));
        process.exit(1);
    });
}