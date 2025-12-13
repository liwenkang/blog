import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import type { Linter } from 'eslint'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
})

const config: Linter.Config[] = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'package-lock.json',
      'yarn.lock',
      '.DS_Store',
      'public/static/favicons/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'plugin:prettier/recommended'),
  {
    files: [
      'pages/**/*.{js,ts,tsx}',
      'components/**/*.{js,ts,tsx}',
      'lib/**/*.{js,ts,tsx}',
      'layouts/**/*.{js,ts,tsx}',
      'scripts/**/*.{js,ts}',
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
      '@next/next/no-img-element': 'off', // Disable img warning for test mocks
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

export default config
