import { Config } from '@rumious/config';
import { readJSON } from '../helpers/index.js';
import path from 'path';
import { spawn } from 'child_process';

const cwd = process.cwd();

export function dev() {
  console.log('[Rumious CLI]: Reading config file');
  const config = readJSON<Config>(path.join(cwd, 'rumious.config.json'));

  console.log('[Rumious CLI]: Detecting builder ');
  const builderCommandMap: {
    [name: string]: () => void;
  } = {
    webpack: () => {
      spawn('webpack ', ['-w'], {
        stdio: 'inherit',
        shell: true,
      });
    },
    rollup: () => {
      spawn('rollup ', ['-c', '-w'], {
        stdio: 'inherit',
        shell: true,
      });
    },
    vite: () => {
      spawn('vite ', [], {
        stdio: 'inherit',
        shell: true,
      });
    },
  };

  const builder = config.builder ? config.builder.name : 'webpack';
  if (!builderCommandMap[builder]) {
    console.error(`[Rumious CLI]: Unsupported builder: ${builder}`);
    return;
  }

  console.log(`[Rumious CLI]: Starting builder: ${builder}`);
  builderCommandMap[builder]();
}
