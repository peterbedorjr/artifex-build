const fs = require('fs');
const Config = require('webpack-chain');
const path = require('path');
const chalk = require('chalk');
const defaultsDeep = require('lodash.defaultsdeep');
const { defaults } = require('./options');
const { error } = require('./utils/log');
const ArtifexPlugin = require('./ArtifexPlugin');

/**
 * @param {*} id 
 * @returns 
 */
const idToPlugin = id => ({
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

        this.pkg = this.resolvePkg();
        this.plugins = this.resolvePlugins(plugins);
    }

    init(mode = process.env.WEE_CLI_MODE) {
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

        this.projectOptions = defaultsDeep(userOptions, defaults());
        this.paths = this.resolvePaths();

        // apply webpack configs from project config file
        if (this.projectOptions.chainWebpack) {
            this.webpackChainFns.push(this.projectOptions.chainWebpack)
        }

        if (this.projectOptions.configureWebpack) {
            this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
        }

        this.plugins.forEach(({ id, apply }) => {
            apply(new ArtifexPlugin(id, this), this.projectOptions)
        });
    }

    resolvePaths() {
        const project = path.resolve(this.context);
        const source = path.resolve(project, this.projectOptions.paths.source);
        const root = path.resolve(project, this.projectOptions.paths.root);
        const assets = path.resolve(root, this.projectOptions.paths.assets);
        const nodeModules = path.resolve(project, 'node_modules');

        return {
            project,
            source,
            root,
            assets,
            nodeModules,
            commands: path.resolve(source, 'commands'),
            styles: path.resolve(source, 'styles'),
            scripts: path.resolve(source, 'scripts'),
            components: path.resolve(source, 'components'),
            images: path.resolve(source, 'images'),
            fonts: path.resolve(source, 'fonts'),
            output: {
                styles: path.resolve(assets, 'styles'),
                scripts: path.resolve(assets, 'scripts'),
                images: path.resolve(assets, 'images'),
                fonts: path.resolve(assets, 'fonts'),
            },
        }
    }

    resolvePkg() {
        if (fs.existsSync(path.resolve(this.context, 'package.json'))) {
            return require(path.resolve(this.context, 'package.json'));
        } else {
            return {}
        }
    }

    pushPlugin(plugin) {
        this.plugins.push(idToPlugin(plugin));
    }

    resolveConfigFile(config) {
        const configs = [
            `.${config}`,
            `.${config}.js`,
            `${config}.config.js`,
        ];
    
        for (let i = 0; i < configs.length; i += 1) {
            const configPath = path.resolve(this.context, configs[i]);
    
            if (fs.existsSync(configPath)) {
                return configPath;
            }
        }
    
        return null;
    }

    resolvePlugins(plugins) {
        let builtInPlugins = [
            // Commands
            './commands/build',
            './commands/inspect',
            './commands/dump',
            // './commands/serve',
            // './commands/make',
            // './commands/lint',

            // // Config
            './config/base',
            // './config/babel',
            // './config/eslint',
            './config/css',
            // './config/dev',
            // './config/copy',
            // './config/purgecss',
            // './config/stylelint',
            // './config/app',
            // './config/prod',
        ];

        if (plugins) {
            builtInPlugins = builtInPlugins.concat(plugins);
        }

        return builtInPlugins.map(idToPlugin);
    }

    loadUserOptions() {
        let fileConfig;

        const configPath = (
            process.env.ARTIFEX_CONFIG_PATH ||
            path.resolve(this.context, 'artifex.config.js')
        );

        if (fs.existsSync(configPath)) {
            try {
                fileConfig = require(configPath);

                if (! fileConfig || typeof fileConfig !== 'object') {
                    error(`Error loading ${chalk.bold('artifex.config.js')}: should export an object.`);

                    fileConfig = null;
                }
            } catch (e) {
                error(`Error loading ${chalk.bold('artifex.config.js')}:`);

                throw e;
            }
        }

        // TODO
        // validate options
        // validate(fileConfig, msg => {
        //     error(`Invalid options in wee.config.js: ${msg}`);
        // });

        return fileConfig;
    }

    resolveChainableWebpackConfig() {
        const chainableConfig = new Config();

        // apply chains
        this.webpackChainFns.forEach(fn => fn(chainableConfig));

        return chainableConfig;
    }

    async run(name, args = {}) {
        const mode = args.mode;

        this.init(mode);

        let command = this.commands[name];

        if (! command) {
            error('Command not found!');
            process.exit(1);
        }

        return command(args);
    }

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
}