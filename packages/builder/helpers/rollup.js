const fs = require('fs');
const path = require('path');

module.exports.generateConfigFile = function(filePath, input, output) {

  const configContent = `
    import babel from '@rollup/plugin-babel';
    import resolve from '@rollup/plugin-node-resolve';
    import commonjs from '@rollup/plugin-commonjs';
    import terser from "@rollup/plugin-terser";
    import path from 'path';
    
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    
    export default {
      input: path.join(__dirname,'${input}'),
      output: {
        file: path.join(__dirname,'${output}','bundle.min.js'),
        format: 'iife',
        name: 'App',
        sourcemap: true,
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
        terser()
      ],
    };
`;

  fs.writeFileSync(filePath, configContent, 'utf8');
}