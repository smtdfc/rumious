import { Config } from '@rumious/config';
import {
  readJSON,
  renderTemplateToFile,
  camelToPascal,
} from '../helpers/index.js';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = process.cwd();

export function gen(itemType: string, name: string) {
  console.log('[Rumious CLI]: Reading config file');
  const config = readJSON<Config>(path.join(cwd, 'rumious.config.json'));

  if (itemType === 'component') {
    renderTemplateToFile(
      resolve(path.join(__dirname, '../data/component/index.tsx.tmpl')),
      { name: camelToPascal(name) },
      resolve(path.join(cwd, `./components/${name}.tsx`)),
    );
  }
}
