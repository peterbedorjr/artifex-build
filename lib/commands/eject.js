const path = require('path');
const fs = require('fs');
const { error } = require('../utils/log');

module.exports = (api, options) => {
    const availableConfigs = [
        'postcss',
        'eslint',
        'stylelint',
        'babel',
    ];

    api.registerCommand('eject', ({ config }) => {
        if (! availableConfigs.includes(config)) {
            error(`No configuration for ${config} found. Available configs are:`);
            
            availableConfigs.forEach((availableConfig) => {
                error(` - ${availableConfig}`);
            });

            return;
        }

        if (config === 'postcss') {
            const filename = 'postcss.config.js';
            const filePath = path.resolve(__dirname, '../', 'config', 'css', filename);

            fs.copyFileSync(filePath, path.resolve(api.artifex.context, filename));
        }

        if (config === 'eslint') {
            const filename = '.eslintrc.js';
            const filePath = path.resolve(__dirname, '../', 'config', 'eslint', filename);

            fs.copyFileSync(filePath, path.resolve(api.artifex.context, filename));
        }

        if (config === 'stylelint') {
            const filename = '.stylelintrc.js';
            const filePath = path.resolve(__dirname, '../', 'config', 'stylelint', filename);

            fs.copyFileSync(filePath, path.resolve(api.artifex.context, filename));
        }

        if (config === 'babel') {
            const filename = 'babel.config.js';
            const filePath = path.resolve(__dirname, '../', 'config', 'babel', filename);

            fs.copyFileSync(filePath, path.resolve(api.artifex.context, filename));
        }
    });
}