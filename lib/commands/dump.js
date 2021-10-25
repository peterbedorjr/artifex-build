const fs = require('fs');
const path = require('path');
const { error } = require('../../utils/log');

module.exports = (api) => {
    api.registerCommand('dump', () => {
        const configPath = path.resolve(api.artifex.context, 'webpack.config.js');

        if (fs.existsSync(configPath)) {
            return error('webpack.config.js file already exists in project root, aborting');
        }

        try {
            const jsonConfig = JSON.stringify(api.resolveWebpackConfig(), null, 2);

            fs.writeFileSync(configPath, `module.exports = ${jsonConfig}`, 'utf-8');
        } catch (e) {
            error(e);
        }
    });
}
