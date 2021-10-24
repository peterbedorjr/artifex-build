const fs = require('fs');
const path = require('path');
const Config = require('webpack-chain');
const merge = require('webpack-merge')
const defaultsDeep = require('lodash.defaultsdeep');

const ArtifexPlugin = require('./ArtifexPlugin');
const { error } = require('../utils/log');
const defaults = require('./config/artifex.config');
const is = require('../utils/is');

/**
 * @param {*} id
 * @returns
 */
 const idToPlugin = (id) => ({
    id: id.replace(/^.\//, ''),
    apply: require(id),
});

module.exports = class Artifex {
    constructor(context, plugins) {
        process.ARTIFEX = this;

        this.initialized = false;
        this.context = context;
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.devServerConfigFns = [];
        this.commands = {};
        this.projectConfiguration = {};

        this.pkg = this.resolvePkg();
        this.plugins = this.resolvePlugins(plugins);
    }

    init(mode = process.env.ARTIFEX_MODE) {
        if (this.initialized) {
            return;
        }

        this.staging = false;

        if (! mode) {
            mode = 'production';
        }

        if (mode === 'staging') {
            mode = 'development';
            this.staging = true;
        }

        this.mode = mode;
        process.env.NODE_ENV = mode;

        this.initialized = true;

        const userOptions = this.loadUserOptions();

        this.projectConfiguration = defaultsDeep(userOptions, defaults());

        // apply webpack configs from project config file
        if (this.projectConfiguration.chainWebpack) {
            this.webpackChainFns.push(this.projectConfiguration.chainWebpack);
        }

        if (this.projectConfiguration.configureWebpack) {
            this.webpackRawConfigFns.push(this.projectConfiguration.configureWebpack);
        }

        // register internal plugins
        this.plugins.forEach(({ id, apply }) => {
            apply(new ArtifexPlugin(id, this), this.projectConfiguration);
        });
    }

    /**
     * Run a command
     *
     * @param {String} name - Command name
     * @param {*} args - Any command line arguments
     * @returns
     */
    async run(name, args) {
        const mode = args.mode;

        this.init(mode);

        let command = this.commands[name];

        if (! command) {
            error('Command not found!');
            process.exit(1);
        }

        return command(args);
    }

    /**
     * Resovle and read the package.json in the provided
     * context
     *
     * @returns {Object} - The contents of the package.json if found
     */
    resolvePkg() {
        if (fs.existsSync(path.resolve(this.context, 'package.json'))) {
            return require(path.resolve(this.context, 'package.json'));
        } else {
            return {}
        }
    }

    /**
     * Load in any provided user options
     *
     * @returns {Object} - The user configuration file
     */
    loadUserOptions() {
        let fileConfig = {};

        const configPath = (
            process.env.ARTIFEX_CONFIG_PATH ||
            path.resolve(this.context, 'artifex.config.js')
        );

        if (fs.existsSync(configPath)) {
            try {
                const conf = require(configPath);

                if (is.function(conf)) {
                    fileConfig = conf(this);
                } else if (is.object(conf)) {
                    fileConfig = conf;
                }

                if (! fileConfig || typeof fileConfig !== 'object') {
                    error(`Error loading ${chalk.bold('artifex.config.js')}: should export an object.`);

                    fileConfig = null;
                }
            } catch (e) {
                error(`Error loading ${chalk.bold('artifex.config.js')}:`);

                throw e;
            }

            // TODO: Validate options

            return fileConfig;
        }

        // TODO
        // validate options
        // validate(fileConfig, msg => {
        //     error(`Invalid options in wee.config.js: ${msg}`);
        // });

        return fileConfig;
    }

    /**
     * Resolve and build a list of plugins, merging
     * in any user supplied plugins
     *
     * @param {Array]} plugins
     * @returns
     */
    resolvePlugins(plugins) {
        let builtInPlugins = [
            // Commands
            // './commands/build',
            // './commands/inspect',
            // './commands/dump',
            // './commands/eject',
            // './commands/serve',
            // './commands/make',
            // './commands/eslint',
            // './commands/stylelint',

            // Config
            // './config/base',
            // './config/babel',
            // './config/eslint',
            // './config/css',
            // './config/dev',
            // './config/copy',
            // './config/purgecss',
            // './config/stylelint',
            // './config/app',
            // './config/prod',
            // './config/html',
            // './config/favicons',

            // Commands
            './commands/build',
            './commands/stylelint',
            './commands/eslint',

            // Config
            './config/base',
            './config/entries',
            './config/output',
            './config/vue',
            './config/css',
            './config/html',
            './config/copy',
            './config/favicons',
            './config/splitting',
            './config/terser',
            './config/prod',
            './config/dev',
            './config/define',
            './config/stylelint',
        ];

        if (plugins) {
            builtInPlugins = builtInPlugins.concat(plugins);
        }

        return builtInPlugins.map(idToPlugin);
    }

    /**
     * @returns {Config} - Chainable webpcak configuration
     */
    resolveChainableWebpackConfig() {
        const chainableConfig = new Config();

        // apply chains
        this.webpackChainFns.forEach(fn => fn(chainableConfig));

        return chainableConfig;
    }

    /**
     * @param {Config} chainableConfig
     * @returns
     */
    resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
        if (! this.initialized) {
            throw new Error('Service must call init() before calling resolveWebpackConfig().');
        }

        // get raw config
        let config = chainableConfig.toConfig();

        // apply raw config fns
        this.webpackRawConfigFns.forEach(fn => {
            if (typeof fn === 'function') {
                // function with optional return value
                const res = fn(config);

                if (res) {
                    config = merge(config, res);
                } else if (fn) {
                    // merge literal values
                    config = merge(config, fn);
                }
            }
        });

        return config;
    }
};
