module.exports = {
    parserOptions: {
        parser: '@babel/eslint-parser',
    },
    extends: [
        // https://github.com/airbnb/javascript
        'airbnb-base',
        // https://eslint.vuejs.org/rules/
        'plugin:vue/recommended',
    ],
    plugins: [
        'import',
        'vue',
    ],
    rules: {
        strict: 0,
        indent: ['error', 4],
        radix: 0,
        'import/no-dynamic-require': 0,
        'no-param-reassign': [
            'error',
            { ignorePropertyModificationsFor: ['state'] },
        ],
        'vue/html-indent': ['error', 4],
    },
};
