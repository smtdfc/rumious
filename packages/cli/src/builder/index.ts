import { Builder } from './builder.js';
import { RollupBuilder } from './rollup.js';
import { WebpackBuilder } from './webpack.js';
import { RumiousConfigFile } from '../types/index.js';
import path from 'path';

export function getBuilder(
  currentDir: string,
  configs: RumiousConfigFile,
  watch: boolean
): Builder {
  const builderType = configs.builder ?? 'webpack';
  
  switch (builderType) {
    case 'rollup':
      return new RollupBuilder(
        currentDir,
        path.join(currentDir, configs.rollupConfigFile ?? 'rollup.config.js'),
        watch
      );
    case 'webpack':
      return new WebpackBuilder(
        currentDir,
        path.join(currentDir, configs.webpackConfigFile ?? 'webpack.config.js'),
        watch
      );
    default:
      throw new Error(`❌ Unsupported builder type: ${builderType}`);
  }
}

