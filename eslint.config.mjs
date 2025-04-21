import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default [
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      import: require('eslint-plugin-import'),
      prettier: require('eslint-plugin-prettier'),
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      quotes: [
        'error',
        'single',
        { avoidEscape: false, allowTemplateLiterals: true },
      ],
      semi: ['error', 'always'],
      
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'import/no-unresolved': 'off',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'es5',
        },
      ],
    },
    ignores: [
      '**/dist/**',
      '**/packages/cli/data/**',
      '**/bundle.js',
      '**/packages/builder/**',
      '**/packages/babel-preset/**',
      '**/packages/ui/**',
      '**/test/**',
    ],
  },
];
