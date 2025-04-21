import { jsonHelper } from '../utils/json.js';
import { ensureDirAndFileExist } from '../utils/file.js';
import { RumiousConfigFile } from '../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

function getLangExt(lang?: string | null): 'jsx' | 'tsx' {
  return ((lang ?? 'js') + 'x') as 'jsx' | 'tsx';
}

async function generateComponent(
  currentPath: string,
  configs: RumiousConfigFile,
  name: string
): Promise<void> {
  const ext = getLangExt(configs.lang);
  const componentFile = path.join(
    path.join(currentPath, configs.entryPoint ?? ''),
    `./components/${name}.${ext}`
  );

  await ensureDirAndFileExist(componentFile, '// Generate by Rumious CLI');

  console.log('📝 Generating component:', name);

  try {
    const templatePath = path.join(__dirname, `../data/component/index.${ext}`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const content = templateContent.replace('IndexComponent', name);

    await fs.writeFile(componentFile, content);
  } catch (error) {
    console.error('❌ Error generating component:', error);
  }
}

export async function generateCommand(
  type: string,
  name: string = ''
): Promise<void> {
  console.log('📝 Checking configuration ....');
  const currentDir = process.cwd();
  const configsFilePath = jsonHelper.readJsonSync(
    path.join(currentDir, 'rumious.configs.json')
  );

  switch (type) {
    case 'component':
      await generateComponent(currentDir, configsFilePath, name);
      break;
    default:
      console.log('❌ Invalid type provided.');
      break;
  }
}
