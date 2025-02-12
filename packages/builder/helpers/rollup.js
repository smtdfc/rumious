import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import rumious from '../plugins/rollup.js';
import dotenv from 'dotenv';
dotenv.config();




function importJson(filePath) {
  const fullPath = path.resolve(filePath);
  const rawData = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(rawData);
}


export function rollupGenerateConfig(configFile, produce = null) {
  const options = {
    prod: process.env.NODE_ENV === 'production'
  }

  const configs = importJson(configFile);
  const cwd = process.cwd();
  const minifyConfigs = options.prod  ? [
    terser({
      maxWorkers: {
        value: os.cpus().length || 1,
      },

      compress: {
        drop_console: true,
        passes: 3,
      },
      mangle: true,
      output: {
        comments: false,
      },
    })
  ] : [];
  let rollupConfigs = {
    input: path.join(cwd, configs.entryPoint ?? 'index.jsx'),
    output: {
      dir: path.join(cwd, configs.outputDir ?? 'public/dist'),
      format: 'es',
      chunkFileNames: 'r_[hash].js',
      entryFileNames: 'bundle.min.js',
      preserveModules: true,
    },
    watch: {
      include: '/**',
      exclude: 'node_modules/**',
    },
    cache: true,
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          './node_modules/rumious-babel-preset/index.js',
        ],
      }),
      ...minifyConfigs,
      rumious(),
    ],
  }

  if (produce) rollupConfigs = produce(rollupConfigs);
  return rollupConfigs;
}