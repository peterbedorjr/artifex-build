#!/usr/bin/env node

// const { Command } = require('commander');
// const { spawn } = require('child_process');
// const path = require('path');
// const pkg = require('../package.json');

// run().catch(err => {
//     console.error(err);

//     process.exitCode = process.exitCode || 1;
//     process.exit();
// });

// async function run() {
//     const program = new Command();

//     program.name('artifex');
//     program.version(pkg.version);

// }

// /**
//  * Execute the script.
//  *
//  * @param {"build"|"watch"} cmd
//  * @param {{[key: string]: any}} opts
//  * @param {string[]} args
//  */
//  async function executeScript(cmd, opts, args = []) {
//     const env = getEffectiveEnv(opts);

//     // We MUST use a relative path because the files
//     // created by npm dont correctly handle paths
//     // containg spaces on Windows (yarn does)
//     const configPath = path.relative(
//         process.cwd(),
//         require.resolve('../generated/webpack.config.js')
//     );

//     const script = [
//         commandScript(cmd, opts),
//         `--config="${configPath}"`,
//         ...quoteArgs(args)
//     ].join(' ');

//     const scriptEnv = {
//         NODE_ENV: env,
//         CONFIG_FILE: opts.config,
//     };

//     if (isTesting()) {
//         process.stdout.write(
//             JSON.stringify({
//                 script,
//                 env: scriptEnv
//             })
//         );

//         return;
//     }

//     function restart() {
//         let child = spawn(script, {
//             stdio: 'inherit',
//             shell: true,
//             env: {
//                 ...process.env,
//                 ...scriptEnv
//             }
//         });

//         let shouldOverwriteExitCode = true;

//         child.on('exit', (code, signal) => {
//             // Note adapted from cross-env:
//             // https://github.com/kentcdodds/cross-env/blob/3edefc7b450fe273655664f902fd03d9712177fe/src/index.js#L30-L31

//             // The process exit code can be null when killed by the OS (like an out of memory error) or sometimes by node
//             // SIGINT means the _user_ pressed Ctrl-C to interrupt the process execution
//             // Return the appropriate error code in that case
//             if (code === null) {
//                 code = signal === 'SIGINT' ? 130 : 1;
//             }

//             if (shouldOverwriteExitCode) {
//                 process.exitCode = code;
//             }
//         });

//         process.on('SIGINT', () => {
//             shouldOverwriteExitCode = false;
//             child.kill('SIGINT');
//         });

//         process.on('SIGTERM', () => {
//             shouldOverwriteExitCode = false;
//             child.kill('SIGTERM');
//         });
//     }

//     restart();
// }

// /**
//  * Get the command arguments with quoted values.
//  *
//  * @param {string[]} args
//  */
//  function quoteArgs(args) {
//     return args.map(arg => {
//         // Split string at first = only
//         const pattern = /^([^=]+)=(.*)$/;
//         const keyValue = arg.includes('=') ? pattern.exec(arg).slice(1) : [];

//         if (keyValue.length === 2) {
//             return `${keyValue[0]}="${keyValue[1]}"`;
//         }

//         return arg;
//     });
// }

// /**
//  * Get the command-specific portion of the script.
//  *
//  * @param {"build"|"watch"} cmd
//  * @param {{[key: string]: any}} opts
//  */
//  function commandScript(cmd, opts) {
//     const showProgress = isTTY() && opts.progress;

//     if (cmd === 'build') {
//         if (showProgress) {
//             return 'npx webpack --progress';
//         }

//         return 'npx webpack';
//     } else if (cmd === 'watch' && !opts.hot) {
//         if (showProgress) {
//             return 'npx webpack --progress --watch';
//         }

//         return 'npx webpack --watch';
//     } else if (cmd === 'watch' && opts.hot) {
//         return 'npx webpack serve --hot' + (opts.https ? ' --https' : '');
//     }
// }

// /**
//  * Get the effective envirnoment to run in
//  *
//  ** @param {{[key: string]: any}} opts
//  */
//  function getEffectiveEnv(opts) {
//     if (opts.production) {
//         return 'production';
//     }

//     if (!process.env.NODE_ENV || (isTesting() && process.env.NODE_ENV === 'test')) {
//         return 'development';
//     }

//     return process.env.NODE_ENV;
// }

// function isTesting() {
//     return process.env.TESTING;
// }

// function isTTY() {
//     if (isTesting() && process.env.IS_TTY !== undefined) {
//         return process.env.IS_TTY === 'true';
//     }

//     if (isTesting() && process.stdout.isTTY === undefined) {
//         return true;
//     }

//     return process.stdout.isTTY;
// }

const { Command } = require('commander');
const glob = require('glob');
const chalk = require('chalk');
const didyoumean = require('didyoumean');
const Artifex = require('../lib/Artifex');
const { error, log } = require('../lib/utils/log');
const pkg = require('../package.json');

const artifex = new Artifex(process.env.ARTIFEX_CONTEXT || process.cwd());

const program = new Command();

program.version(pkg.version);

const commands = ['build', 'dump'];

program
    .command('build')
    .description('build for specified environment')
    .option('-r, --report', 'Open webpack bundle analyzer in a browser')
    .option('-s, --silent', 'Do not output any information to the console')
    .option('-l, --lint', 'Lint Vue and JS files', { defaultValue: true })
    .option('-m, --mode [mode]', 'The environment to build for', 'production')
    .action((options) => {
        artifex.run('build', options).catch((err) => {
            log();
            log(err);
            process.exit(1);
        });
    });

program
    .command('dump')
    .description('dump underlying webpack config')
    .action((options) => {
        artifex.run('dump', options).catch((err) => {
            log();
            log(err);
            process.exit(1);
        });
    });


function registerUsercommands() {
    const artifex = new Artifex(process.env.WEE_CLI_CONTEXT || process.cwd());
    artifex.init();

    const userCommands = glob.sync(`${artifex.paths.commands}/**/*.js`);

    userCommands.forEach((command) => require(command)(program, service));
}

registerUsercommands();

// Output help if no command was executed
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.on('command:*', ([cmd]) => {
    const match = didyoumean(cmd, commands);

    error(`Invalid command: ${chalk.bold(program.args.join(' '))}`);
    
    if (match) {
        log()
        log(`Did you mean "${didyoumean(cmd, commands)}"?`);
    }

    log();
    log('See --help for a list of available commands.');
    process.exit(1);
});

program.parse(process.argv);