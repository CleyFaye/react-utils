module.exports = {
    "env": {
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2,
        ],
        "no-unused-vars": [
            "error",
            { "argsIgnorePattern": "^_" },
        ],
        "no-console": "off",
        "linebreak-style": [
            "error",
            "unix",
        ],
        "quotes": [
            "error",
            "double",
        ],
        "semi": [
            "error",
            "always",
        ],
    },
};