const fs = require('fs');
const path = require('path');

module.exports.generateConfigFile = function(filePath, input, output, prod = false) {

  const configContent = `
    import babel from '@rollup/plugin-babel';
    import resolve from '@rollup/plugin-node-resolve';
    import commonjs from '@rollup/plugin-commonjs';
    import terser from "@rollup/plugin-terser";
    import path from 'path';
    import os from "os";
    
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    
    export default {
      input: path.join(__dirname,'${input}'),
      output: {
        dir: path.join(__dirname,'${output}'), 
        format: 'es',
        chunkFileNames: 'r_[hash].js', 
        entryFileNames: 'bundle.min.js',
        preserveModules: true, 
        ${!prod?`sourcemap: true,`:""}
      },
      plugins: [
        resolve(),
        commonjs(),
        babel({
          babelHelpers: 'bundled',
          presets: [
            './node_modules/rumious-babel-preset/index.js',
          ],
       }),
        terser({
          ${prod ?`compress: {
            drop_console: true,
            passes: 3, 
          },
          mangle: true, 
          output: {
            comments: false, 
          },`:""}
          maxWorkers: {
            value: os.cpus().length || 1,
          }
        })
      ],
    };
`;

  fs.writeFileSync(filePath, configContent, 'utf8');
}