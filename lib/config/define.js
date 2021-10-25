const fs = require('fs');
const path = require('path');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        // Define ENV
        config.plugin('define')
            .use(require('webpack/lib/EnvironmentPlugin'), [{
                NODE_ENV: api.artifex.mode,
            }])
            .end();

        if (fs.existsSync(path.join(api.artifex.context, '.env'))) {
            config.plugin('env')
                .use(require('dotenv-webpack'));
        }
    });
};
