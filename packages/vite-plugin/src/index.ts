import type { Plugin } from 'vite';
import type { PluginOption } from './types/index.js';
import { Compiler } from '@rumious/compiler';
import type { Config } from '@rumious/config';
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

export default function (options: PluginOption = {}): Plugin {
  return {
    name: 'vite-plugin-rumious',

    configResolved(config) {
      console.log('Resolved Vite config:', config.root);
    },

    transform(source: string, id: string) {
      const config: Config = options.configFile
        ? readJSON<Config>(options.configFile)
        : {
            environment: '@rumious/browser',
          };

      const compiler = new Compiler({
        environment: config.environment,
      });

      try {
        const result = compiler.compile(source, {
          filename: id,
          type: 'module',
        });

        return {
          code: result.code,
          map: result.map ?? null,
        };
      } catch (err: any) {
        this.warn(
          `[vite-plugin-rumious] Compile failed for ${id}:\n${err.message}`,
        );
        return null;
      }
    },
  };
}
