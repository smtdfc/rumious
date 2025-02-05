import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);


export default {
  input: path.join(__dirname,'index.jsx'),
  output: {
    file: path.join(__dirname,'public/dist/bundle.min.js'),
    format: 'iife',
    name: 'App',
    sourcemap:true
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets:[
        "./node_modules/rumious-babel-preset/index.js"
      ]
    })
  ]
};