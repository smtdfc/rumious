import { promises as fs } from 'fs';
import fsSync from 'fs';
import {RumiousConfigFile} from '../types/index.js';

interface JsonHelper {
  readJsonSync: (filePath: string) => RumiousConfigFile;
  readJsonAsync: (filePath: string) => Promise < RumiousConfigFile > ;
}

export const jsonHelper: JsonHelper = {
  
  readJsonSync: (filePath) => {
    try {
      const data = fsSync.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Error reading JSON file: ${(error as Error).message}`);
    }
  },
  readJsonAsync: async (filePath) => {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Error reading JSON file: ${(error as Error).message}`);
    }
  },
};