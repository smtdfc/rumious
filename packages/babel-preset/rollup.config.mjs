import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const isProduction = process.env.NODE_ENV === 'production';

const getOutputConfigs = () => {
  const outputs = [
    {
      file: path.join(__dirname, 'dist/bundle.iife.js'),
      format: 'iife',
      name: 'Rumious',
      sourcemap: !isProduction,
    },
    {
      file: path.join(__dirname, 'dist/bundle.esm.js'),
      format: 'esm',
      sourcemap: !isProduction,
    },
    {
      file: path.join(__dirname, 'dist/bundle.cjs.js'),
      format: 'cjs',
      sourcemap: !isProduction,
    },
  ];

  // Thêm bản minify cho production
  if (isProduction) {
    outputs.push({
      file: path.join(__dirname, 'dist/bundle.iife.min.js'),
      format: 'iife',
      name: 'Rumious',
      plugins: [terser()], // Minify chỉ cho production
      sourcemap: false,
    });
  }

  return outputs;
};

export default {
  input: path.join(__dirname, 'src/index.js'),
  output: getOutputConfigs(),
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled', // Hỗ trợ các helper của Babel
      presets: [
        ['@babel/preset-env'],
        ...(isProduction ? [['minify', { removeConsole: true }]] : []), // Minify chỉ khi build production
      ],
      compact: true,
    }),
  ],
};