import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { exec } from 'child_process';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";
import rumious from '../plugins/rollup.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    let arg = argv[i];
    if (arg.startsWith("--")) {
      let key, value;
      if (arg.includes("=")) {
                [key, value] = arg.split("=");
      } else {
        key = arg;
        value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      }
      args[key.replace(/^--/, "")] = value;
    }
  }
  return args;
}


function importJson(filePath) {
  const fullPath = path.resolve(filePath);
  const rawData = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(rawData);
}


export function rollupGenerateConfig(configFile, produce=null) {
  const options = parseArgs(process.argv);
  const configs = importJson(configFile);
  const cwd = process.cwd();
  const minifyConfigs = options.mode == "prod" ?
  {
    compress: {
      drop_console: true,
      passes: 3,
    },
    mangle: true,
    output: {
      comments: false,
    },
  } : {};
  const rollupConfigs =  {
    input: path.join(cwd, configs.entryPoint ?? "index.jsx"),
    output: {
      dir: path.join(__dirname, configs.outputDir ?? "public/dist"),
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
      terser({
        ...minifyConfigs,
        maxWorkers: {
          value: os.cpus().length || 1,
        }
      }),
      rumious(),
    ],
  }
  
  if(produce) rollupConfigs = produce(rollupConfigs);
  return rollupConfigs;
}