import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

function generateHash() {
  return randomUUID();
}

function importJson(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const rawData = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading JSON file at ${filePath}:`, error);
    return {}; 
  }
}

function validateConfigs(configs) {
  return configs;
}

export default function rumious(options = {}) {
  const cwd = process.cwd();
  const configFilePath = path.join(cwd, options.configFile || 'rumious.configs.json');
  const configs = importJson(configFilePath);

  validateConfigs(configs);

  return {
    name: 'rollup-plugin-rumious',

    buildStart() {
      console.log('Rumious Builder: Start compiling....');
    },

    buildEnd() {
      console.log('Rumious Builder: Compilation finished.');
    },

    resolveId(source, importer) {
      if (/\.(png|jpg|jpeg|gif|svg|mp3|mp4|wav|ogg|webm)$/i.test(source)) {
        if (!configs.allowImportMediaFiles) {
          this.error({
            message: 'Importing media files is not allowed. Please enable the "allowImportMediaFiles" option in your configuration.',
            plugin: 'rollup-plugin-rumious',
          });
        }
       
        return path.resolve(path.dirname(importer), source);
      }

      if (source.endsWith('.rumious')) {
        if (!configs.allowRumiousFiles) {
          this.error({
            message: 'Importing .rumious files is not allowed. Please enable the "allowRumiousFiles" option in your configuration.',
            plugin: 'rollup-plugin-rumious',
          });
        }
        return path.resolve(path.dirname(importer), source);
      }
      return null;
    },

    load(id) {
      if (id.endsWith('.rumious')) {
        const code = fs.readFileSync(id, 'utf-8');
        return { code, map: null };
      }

      if (/\.(png|jpg|jpeg|gif|svg|mp3|mp4|wav|ogg|webm)$/i.test(id)) {
        const referenceId = this.emitFile({
          type: 'asset',
          name: path.basename(id),
          source: fs.readFileSync(id),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
      return null;
    },

    augmentChunkHash() {
      return generateHash();
    },

    options(configOptions) {
      return configOptions;
    },
  };
}