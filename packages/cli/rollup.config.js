import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import os from 'os';

const shouldMinify = process.env.MINIFY === 'true';


export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [
        ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
      ],
    }),
    shouldMinify &&
    terser({
      module: true,
      compress: { defaults: true },
      mangle: true,
      output: { comments: false },
      maxWorkers: os.cpus().length || 1
    })
  ].filter(Boolean),
};