#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

const Artifex = require('../lib/Artifex');
const { log, error, clearConsole } = require('../utils/log');
const to = require('../utils/to');

const pkg = require('../package.json');

const artifex = new Artifex(process.env.ARTIFEX_CONTEXT || process.cwd());

program.version(pkg.version);

const actionHandler = async (options, command) => {
    const [err, res] = await to(artifex.run(command._name, options));

    log();

    err ? error(err) : log(res);

    process.exit(1);
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

program.parse(process.argv);
