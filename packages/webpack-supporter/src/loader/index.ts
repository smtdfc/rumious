import type { LoaderDefinition } from 'webpack';
import { compile } from 'rumious-compiler';

const rumiousLoader: LoaderDefinition = function(source) {
  const filename = this.resourcePath;
  
  try {
    const code = compile(source, filename);
    return code;
  } catch (err) {
    this.emitError(new Error(`[Rumious Loader Error]\nFile: ${filename}\n${(err as Error).message}`));
    throw err;
  }
};

export default rumiousLoader;