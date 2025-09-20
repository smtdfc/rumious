import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import os from 'os';
import { getWorkspacePackages } from '../../helpers/index.js';

const isProduction = process.env.NODE_ENV === 'production';
const localPackages = getWorkspacePackages();

export default {
  input: 'src/index.ts',
  external: [
    ...Object.keys(localPackages),
    'cac',
    'fs',
    'path',
    'child_process',
    'url',
  ],
  output: {
    file: './dist/index.js',
    format: 'esm',
    sourcemap: !isProduction,
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: 'auto',
    }),
    typescript({ tsconfig: './tsconfig.json' }),
    isProduction &&
      terser({
        maxWorkers: os.cpus().length || 1,
      }),
  ],
};
