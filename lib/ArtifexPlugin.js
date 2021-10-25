const path = require('path');
const fs = require('fs');

const is = require('../utils/is');

module.exports = class ArtifexPlugin {
    /**
     * @param {string} id - Id of the plugin.
     * @param {Artifex} artifex - An instance of Artifex.
     */
    constructor(id, artifex) {
        this.id = id
        this.artifex = artifex
    }

    /**
     * Resolve path for a project.
     *
     * @param {string} _path - Relative path from project root
     * @return {string} The resolved absolute path.
     */
    resolve(_path) {
        return path.resolve(this.artifex.context, _path);
    }

    /**
     * Resolve path for source
     *
     * @param {...String} _path relative path from the source root
     * @return {String} The resolved absolute path
     */
    resolveSourcePath(..._path) {
        return path.resolve(
            this.artifex.context,
            this.artifex.projectConfiguration.paths.source.root,
            ..._path,
        );
    }

    /**
     * Resolve path for output
     *
     * @param {...String} _path relative path from the output root
     * @return {String} The resolved absolute path
     */
     resolveOutputPath(..._path) {
        return path.resolve(
            this.artifex.context,
            this.artifex.projectConfiguration.paths.root,
            this.artifex.projectConfiguration.paths.output.root,
            ..._path,
        );
    }

    /**
     * Register a command that will become available as `artifex [name]`.
     *
     * @param {string} name
     * @param {function} fn
     *   (args: { [string]: string }, rawArgs: string[]) => ?Promise
     */
    registerCommand(name, fn) {
        this.artifex.commands[name] = fn;
    }

    /**
     * Check if the project has a given plugin.
     *
     * @param {string} id - Plugin id
     * @return {boolean}
     */
    hasPlugin(id) {
        return this.artifex.plugins.some(p => id === p.id);
    }

    /**
     * Register a function that will receive a chainable webpack config
     * the function is lazy and won't be called until `resolveWebpackConfig` is
     * called
     *
     * @param {function} fn
     */
    chainWebpack(fn) {
        this.artifex.webpackChainFns.push(fn);
    }

    /**
     * Register
     * - a webpack configuration object that will be merged into the config
     * OR
     * - a function that will receive the raw webpack config.
     *   the function can either mutate the config directly or return an object
     *   that will be merged into the config.
     *
     * @param {object | function} fn
     */
    configureWebpack(fn) {
        this.artifex.webpackRawConfigFns.push(fn);
    }

    /**
     * Register a dev serve config function. It will receive the express `app`
     * instance of the dev server.
     *
     * @param {function} fn
     */
    configureDevServer(fn) {
        this.artifex.devServerConfigFns.push(fn)
    }

    /**
     * Resolve the final raw webpack config, that will be passed to webpack.
     *
     * @param {ChainableWebpackConfig} [chainableConfig]
     * @return {object} Raw webpack config.
     */
    resolveWebpackConfig(chainableConfig) {
        return this.artifex.resolveWebpackConfig(chainableConfig)
    }

    /**
     * Resolve an intermediate chainable webpack config instance, which can be
     * further tweaked before generating the final raw webpack config.
     * You can call this multiple times to generate different branches of the
     * base webpack config.
     * See https://github.com/mozilla-neutrino/webpack-chain
     *
     * @return {ChainableWebpackConfig}
     */
    resolveChainableWebpackConfig() {
        return this.artifex.resolveChainableWebpackConfig()
    }

    /**
     * Check to see if an option is enabled
     *
     * @param {*} option
     */
    optionEnabled(option) {
        return (is.bool(option) && option === true)
            || (is.object(option) && Object.keys(option).length > -1)
            || (is.string(option) && option.length);
    }

    /**
     * Find the path of provided configuration file type
     * based on common configuration file name formats
     *
     * @param {string} config
     * @returns
     */
    resolveConfigFile(config) {
        const configs = [
            `.${config}rc`,
            `.${config}rc.js`,
            `.${config}rc.yaml`,
            `.${config}rc.json`,
            `${config}.config.js`,
        ];

        for (let i = 0; i < configs.length; i += 1) {
            const configPath = this.resolve(configs[i]);

            if (fs.existsSync(configPath)) {
                return configPath;
            }
        }

        return null;
    }

    /**
     * Check if we're in production mode
     *
     * @returns {bool}
     */
    isInProduction() {
        return this.artifex.mode === 'production';
    }

    /**
     * Check if we're in development mode
     *
     * @returns {bool}
     */
    isInDevelopment() {
        return this.artifex.mode === 'development' && ! this.artifex.staging;
    }
}
