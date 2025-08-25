// ESLint 9 Flat Config
// Migrated from .eslintrc.js via FlatCompat, keeping behavior as close as possible

// Note: ESLint will prefer this file over .eslintrc.js

const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const globals = require('globals');

// Plugins (CommonJS require so this file runs without transpilation)
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierPlugin = require('eslint-plugin-prettier');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  // Global ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'android/',
      'ios/',
      'old/',
      'test/',
      '**/__tests__/*',
      '**/*.test.js',
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // Convert legacy "extends" as a baseline
  ...compat.extends([
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ]),

  // Project-specific settings, plugins and rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-native/no-color-literals': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // TS-specific tweaks matching previous config
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'prettier/prettier': ['error', { parser: 'typescript' }],
    },
  },

  // Test files environment
  {
    files: ['**/*.test.js', '**/__tests__/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
