const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const path = require('path')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  ...compat.extends('next/core-web-vitals', 'plugin:prettier/recommended'),
  {
    files: [
      'pages/**/*.js',
      'components/**/*.js',
      'lib/**/*.js',
      'layouts/**/*.js',
      'scripts/**/*.js',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      'react/no-unescaped-entities': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.mdx'],
    ...compat.extends('plugin:mdx/recommended'),
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
]
