import type { LoaderDefinition } from 'webpack';
import { compile } from 'rumious-compiler';

const rumiousLoader: LoaderDefinition = function(source) {
  const filename = this.resourcePath;
  
  const code = compile(source, filename);
  return code;
};

export default rumiousLoader;