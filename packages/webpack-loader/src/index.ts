import type { LoaderContext } from 'webpack';
//import type { Config } from '@rumious/config';
//import type { LoaderOptions } from './types/index.js'
import { Compiler } from '@rumious/compiler';

export default function rumiousLoader(
  this: LoaderContext<object>,
  source: string,
): void {
  const callback = this.async();
  //const options = this.getOptions();

  const compiler = new Compiler({
    environment: '@rumious/browser',
  });

  try {
    const { code, map } = compiler.compile(source, {
      filename: '',
      type: 'module',
    });
    callback(null, code, map);
  } catch (err) {
    callback(err as Error);
  }
}
