let artifex = process.ARTIFEX_SERVICE

if (! artifex) {
    const Artifex = require('../../Artifex');
    artifex = new Artifex(process.env.ARTIFEX_CONTEXT || process.cwd())
    artifex.init(process.env.NODE_ENV)
}

module.exports = artifex.resolveWebpackConfig();
