// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';

export default tseslint.config([
  // Global ignores
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },

  // Base config for all files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // TypeScript specific config
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'check-file': checkFile,
      import: importPlugin,
      jsdoc: jsdoc,
      prettier: eslintPluginPrettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Import rules
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            /*
            App Layer (top) → Features Layer → Shared Layer (bottom)
            
            Shared layer:   can't import from features or app
            Features layer: can't import from app or each other
            App layer:      can import from anywhere
          */
            {
              target: './src/features',
              from: './src/app',
            },
            {
              target: './src/features/*/!(index.js|index.ts)',
              from: './src/features/*/!(index.js|index.ts)',
            },
            {
              target: [
                './src/components',
                './src/hooks',
                './src/lib',
                './src/types',
                './src/utils',
              ],
              from: ['./src/features', './src/app'],
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // JSDoc policy: every export documented; params optional (types self-document)
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          contexts: [
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'ExportNamedDeclaration > FunctionDeclaration',
          ],
          exemptEmptyFunctions: true,
        },
      ],
      'jsdoc/require-param': 'off',

      // File naming conventions
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Doc quality (components/hooks/features only): JSDoc blocks must carry a
  // real description — no empty stubs. Member-level prop docs and param docs
  // are conventions (see AGENTS.md), not mechanically enforceable.
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/features/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
    ],
    ignores: ['**/*.stories.*'],
    settings: { jsdoc: { mode: 'typescript' } },
    rules: {
      'jsdoc/require-description': 'error',
    },
  },

  // Hook/helper params are documented via @param wherever a JSDoc block
  // exists (component files stay exempt — props live on the Props interface).
  {
    files: ['src/features/**/*.ts', 'src/hooks/**/*.ts'],
    settings: { jsdoc: { mode: 'typescript' } },
    rules: {
      'jsdoc/require-param': ['error', { checkDestructured: false }],
    },
  },
], storybook.configs["flat/recommended"]);
