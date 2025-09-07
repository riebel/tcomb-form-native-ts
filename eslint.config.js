const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierPlugin = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
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

  // Basis-Empfehlungen für JS
  js.configs.recommended,

  // JS config files
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Globale Regeln für JS/TS/React/React Native
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
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
      // Prettier
      'prettier/prettier': 'error',

      // TypeScript
      // Disable base rule in TS files to avoid false positives; use the TS version instead
      'no-unused-vars': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none', // Parameter in Funktionen & Typdefinitionen nie melden
          vars: 'all',
          ignoreRestSiblings: true,
        },
      ],

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native
      'react-native/no-color-literals': 'off',
    },
  },

  // TS-spezifische Prettier-Regeln
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'prettier/prettier': ['error', { parser: 'typescript' }],
    },
  },

  // Test-Umgebung
  {
    files: ['**/*.test.js', '**/__tests__/*.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
];
