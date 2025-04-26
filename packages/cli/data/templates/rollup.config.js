import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import os from 'os';

const shouldMinify = process.env.MINIFY === 'true' || process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'public/dist',
    format: 'esm',
    sourcemap: !shouldMinify,
    entryFileNames: 'index.min.js',
    manualChunks(id) {
      if (id.includes('node_modules')) {
        return 'vendor';
      }
    },
    chunkFileNames: (chunkInfo) => {
      if (chunkInfo.moduleIds.some(id => id.includes('node_modules'))) {
        return 'vendor/[name].js';
      }
      return 'chunks/[name]-[hash].js';
    },
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
      ],
      plugins: ['@babel/plugin-syntax-jsx', 'babel-plugin-rumious'],
    }),
    shouldMinify &&
    terser({
      compress: {
        drop_console: true,
        passes: 3,
        pure_getters: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        sequences: true,
        booleans: true,
        hoist_funs: true,
        hoist_vars: true,
        reduce_funcs: true,
        reduce_vars: true,
        collapse_vars: true,
        join_vars: true,
        typeofs: true,
        inline: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
      output: {
        comments: false,
        beautify: false,
      },
      maxWorkers: os.cpus().length || 1,
    }),
  ].filter(Boolean),
};