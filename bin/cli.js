#!/usr/bin/env node

const { Command } = require('commander');
const didyoumean = require('didyoumean');
const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

const Artifex = require('../lib/Artifex');
const { log, error, info } = require('../utils/log');
const to = require('../utils/to');
const pkg = require('../package.json');

const artifex = new Artifex(process.env.ARTIFEX_CONTEXT || process.cwd());
const commands = ['build', 'dump', 'inspect', 'eject', 'eslint', 'stylelint', 'serve'];

const program = new Command();
program.version(pkg.version);

/**
 * Generic action handler
 *
 * @param {Array} options - Array of options
 * @param {String} command - command
 */
const actionHandler = async (options, command) => {
    const [err, res] = await to(artifex.run(command._name, options));

    log();

    err ? error(err) : log(res);

    process.exit(1);
}

// Output help if no command was executed
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program
    .command('build')
    .description('build for specified environment')
    .option('-r, --report', 'Open webpack bundle analyzer in a browser')
    .option('-s, --silent', 'Do not output any information to the console')
    .option('-l, --lint', 'Lint Vue and JS files', { defaultValue: true })
    .option('-m, --mode [mode]', 'The environment to build for', 'production')
    .action(actionHandler);


program
    .command('stylelint')
    .description('lint the project with stylelint')
    .option('-f, --fix', 'automatically fix certain stylelint errors')
    .option('-s, --silent', 'don\'t report errors or warnings')
    .action(actionHandler);

program
    .command('eslint')
    .description('lint the project with eslint')
    .option('-f, --fix', 'automatically fix certain eslint errors')
    .option('-s, --silent', 'don\'t report errors or warnings')
    .action(actionHandler);

program
    .command('dump')
    .description('dump the current webpack config to the console')
    .action(actionHandler);

program
    .command('eject')
    .description('copies specified configuration file to project root')
    .requiredOption('-c, --config <config>', 'Open webpack bundle analyzer in a browser')
    .action(actionHandler);

program
    .command('inspect')
    .description('log the current webpack config to the console')
    .action(actionHandler);

// lol
program.on('command:party', () => {
    const request = require('request');

    request
        .get('http://parrot.live')
        .on('response', (response) => {
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                console.log(chunk);
            });

            setTimeout(() => {
                log();
                log('Okay, party\'s over...');
                process.exit(1);
            }, 20000);
        });
});

(function() {
    const userCommands = glob.sync(`${path.resolve(process.cwd(), 'source/commands')}/**/*.js`);

    userCommands.forEach((cmd) => {
        require(cmd)(program, artifex);
    });
})();

program.on('command:*', ([cmd]) => {
    const match = didyoumean(cmd, commands);

    error(`Invalid command: ${chalk.bold(program.args.join(' '))}`);

    if (match) {
        log()
        info(`Did you mean "${didyoumean(cmd, commands)}"?`);
    }

    log();
    log('See --help for a list of available commands.');
    process.exit(1);
});

program.parse(process.argv);
