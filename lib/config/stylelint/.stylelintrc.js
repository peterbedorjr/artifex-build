module.exports = {
    extends: ['stylelint-config-standard-scss'],
    plugins: [
        'stylelint-order',
        'stylelint-scss',
    ],
    rules: {
        'order/properties-alphabetical-order': true,
        'scss/dollar-variable-pattern': /[a-z][a-zA-Z]+/, // TODO: Maybe actually use kebab case variables
        'scss/at-mixin-pattern': /[a-z][a-zA-Z]+/,
        'at-rule-no-unknown': null,
        'no-eol-whitespace': null,
        indentation: 4,
        'number-leading-zero': null,
        'at-rule-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'property-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'string-quotes': 'single',
        'at-rule-name-case': null,
    },
};
