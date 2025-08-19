import { Config } from '@rumious/config';
import { readJSON } from '../helpers/index.js';
import path from 'path';
import { spawn } from 'child_process';

const cwd = process.cwd();

export function typecheck() {
  console.log('[Rumious CLI]: Reading config file');
  const config = readJSON<Config>(path.join(cwd, 'rumious.config.json'));

  console.log('[Rumious CLI]: Detecting language ');
  const lang = config.lang ?? 'typescript';
  if (lang !== 'typescript') {
    console.error(`[Rumious CLI]: Cannot type checking with language: ${lang}`);
    return;
  }

  console.log('[Rumious CLI]: Starting TSC');
  spawn('tsc', ['--noEmit'], {
    stdio: 'inherit',
    shell: true,
  });
}
