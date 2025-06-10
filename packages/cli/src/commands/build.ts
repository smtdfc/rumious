import { jsonHelper } from '../utils/json.js';
import { RumiousConfigFile, BuildCommandOptions } from '../types/index.js';
import * as path from 'path';
import { getBuilder } from '../builder/index.js';

export async function buildCommand(
  mode: string = 'dev',
  options: BuildCommandOptions
): Promise < void > {
  console.log('📝 Checking configuration ....');
  const currentDir = process.cwd();
  const configsFilePath = jsonHelper.readJsonSync(
    path.join(currentDir, 'rumious.configs.json')
  ) as RumiousConfigFile;
  
  const isProd = mode === 'prod';
  
  if (isProd) {
    process.env.NODE_ENV = 'production';
  }
  
  try {
    const builder = getBuilder(currentDir, configsFilePath, options.watch ?? false);
    builder.run();
  } catch (err: any) {
    console.error(err.message);
  }
}