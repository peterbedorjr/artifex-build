module.exports = (api, options) => {
    api.registerCommand('inspect', (args) => {
        console.log(api.resolveWebpackConfig());
    });
}