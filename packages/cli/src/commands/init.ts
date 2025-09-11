import path from 'path';
import { cpSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = process.cwd();

export function init(options: any) {
  console.log('[Rumious CLI]: Initializing project');
  const from = resolve(path.join(__dirname, '../data/project'));

  const to = resolve(path.join(cwd));

  cpSync(from, to, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });

  if (options.install) {
    console.log(`[Rumious CLI]: Installing ...`);

    spawn('npm', ['i', '@rumious/core', '@rumious/browser'], {
      stdio: 'inherit',
      shell: true,
    });

    spawn('npm', ['i', '-D','webpack','webpack-cli','ts-loader', '@rumious/webpack-loader'], {
      stdio: 'inherit',
      shell: true,
    });
  }

  console.log('[Rumious CLI]: Project created successfully');
}
