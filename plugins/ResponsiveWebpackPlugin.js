const fs = require('fs');
const path = require('path');

/**
 * Build the breakpoint
 *
 * @param {String} breakpoint
 * @param {Number} count
 */
 const buildBreakpoint = (breakpoint, count) => `@include ${breakpoint} { html { font-family: '${count}'; } }\n`;

/**
 * Create a mixin based on the provided breakpoint information
 *
 * @param {String} breakpoint
 * @param {Number} condition
 */
const buildMixin = (breakpoint, condition, offset = 25) => `@mixin ${breakpoint}() { @media (min-width: ${condition - offset}px) { @content; } }\n`;

class ResponsiveWebpackPlugin {
    constructor(config = {}) {
        this.config = config;
    }

    apply(compiler) {
        const {
            breakpoints,
            context,
            offset = 25,
            output = '',
        } = this.config;
        const outputPath = path.join(context || compiler.options.context, output);
        const mixinsPath = path.join(outputPath, '_mixins.scss');
        const breakpointsPath = path.join(outputPath, '_breakpoints.scss');
        const fsOptions = { flag: 'w', encoding: 'utf-8' };
        let count = 1;

        const result = {
            responsive: [
                `/* stylelint-disable */\n`,
                `@import 'mixins';\n`,
                `html { font-family: '1'; }`,
            ],
            mixins: ['/* stylelint-disable */'],
        };

        if (! breakpoints || (! breakpoints && ! Object.keys(breakpoints))) {
            throw new Error('ResponiveWebpackPlugin: breakpoints configuration option is required');
        }

        compiler.hooks.initialize.tap('Responsive Plugin', () => {
            Object.entries(breakpoints).forEach(([breakpoint, condition]) => {
                count += 1;

                result.mixins.push(buildMixin(breakpoint, condition, offset));
                result.responsive.push(buildBreakpoint(breakpoint, count));
            });

            if (! fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }

            fs.writeFileSync(breakpointsPath, result.responsive.join('\n'), fsOptions);
            fs.writeFileSync(mixinsPath, result.mixins.join('\n'), fsOptions);
        });
    }
}

module.exports = ResponsiveWebpackPlugin
