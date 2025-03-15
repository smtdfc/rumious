import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/dev/*',
      '**/dist/*',
      '**/test/*',
      'tsconfig.json',
    ]
  },
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'semi':['error','always']
    }
  },
];