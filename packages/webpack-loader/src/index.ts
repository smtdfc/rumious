import type { LoaderContext } from 'webpack';
import type { Config } from '@rumious/config';
import type { LoaderOptions } from './types/index.js';
import { Compiler } from '@rumious/compiler';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readJSON<T = any>(path: string): T {
  try {
    const fullPath = resolve(path);
    const content = readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    throw new Error(`Cannot read file ${path}: ${(err as Error).message}`);
  }
}

export default function rumiousLoader(
  this: LoaderContext < object > ,
  source: string,
): void {
  const callback = this.async();
  const options: LoaderOptions = this.getOptions() as LoaderOptions;
  const config: Config = options.configFile ?
    readJSON < Config > (options.configFile) :
    {
      environment: '@rumious/browser',
    };
  
  const compiler = new Compiler({
    environment: config.environment,
  });
  
  try {
    const { code, map } = compiler.compile(source, {
      filename: this.resourcePath,
      type: 'module',
    });
    callback(null, code, map);
  } catch (err) {
    callback(err as Error);
  }
}