const path = require('path');

const { log } = require('../../utils/log');

module.exports = (api, options) => {
    api.chainWebpack((config) => {
        const { source, output } = options.paths;

        for (let entry in options.script.entry) {
            config.entry(path.join(output.scripts, entry))
                .add(path.resolve(source.root, source.scripts, options.script.entry[entry]));
        }

        for (let entry in options.style.entry) {
            config.entry(path.join(output.styles, entry))
                .add(path.resolve(source.root, source.styles, options.style.entry[entry]));
        }
    });
};
