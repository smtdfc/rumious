import { Plugin } from 'rollup';
import { Compiler } from '@rumious/compiler';

export default function rumiousRollupPlugin(): Plugin {
  return {
    name: 'rumious-rollup-plugin',
    
    transform(source: string, id: string) {
      
      const compiler = new Compiler({
        environment: '@rumious/browser',
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
        this.warn(`[rumious-rollup-plugin] Compile failed for ${id}:\n${err.message}`);
        return null;
      }
    }
  };
}