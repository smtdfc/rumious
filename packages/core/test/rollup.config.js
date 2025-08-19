import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: './.testious/node.js',
    external: ['testious', 'testious-node-runner'],
    output: {
      file: './.testious/dist/node.runner.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [],
  },
  {
    input: './.testious/browser.js',
    external: [],
    output: {
      file: './.testious/dist/browser.runner.js',
      format: 'iife',
      sourcemap: true,
      name: 'TestiousBrowserRunner',
    },
    plugins: [
      resolve({
        browser: true,
        extensions: ['.js', '.mjs'],
      }),
      commonjs(),
    ],
  },
];
