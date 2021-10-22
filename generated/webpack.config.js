module.exports = async () => {
    const config = require ('../config/base.config');

    return config.toConfig();
};