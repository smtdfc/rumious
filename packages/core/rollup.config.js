import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import os from 'os';

const shouldMinify = process.env.MINIFY === 'true';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const basePlugins = () => [
  resolve({ extensions }),
  commonjs(),
  babel({
    babelHelpers: 'bundled',
    extensions,
    presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
  }),
];

const createConfig = ({ input, file, format, name, exportsType }) => ({
  input,
  output: {
    file,
    format,
    name,
    exports: exportsType,
    globals: {
    },
  },
  plugins: [
    ...basePlugins(),
    shouldMinify &&
      terser({
        module: true,
        compress: { defaults: true },
        mangle: true,
        output: { comments: false },
        maxWorkers: os.cpus().length || 1,
      }),
  ].filter(Boolean),
});

export default [
  createConfig({
    input: 'src/index.ts',
    file: 'dist/index.esm.js',
    format: 'esm',
    exportsType: 'named',
  }),

  createConfig({
    input: 'src/index.global.ts', 
    file: 'dist/index.min.js',
    format: 'iife',
    name: 'Rumious',
    exportsType: 'default', 
  }),
];