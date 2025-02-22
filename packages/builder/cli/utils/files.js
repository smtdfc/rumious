import path from 'path';
import { promises as fs } from 'fs';

export async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function importJson(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const rawData = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading JSON file at ${filePath}:`, error);
    return {};
  }
}

export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}


export async function ensureFileExists(filePath, defaultContent = '') {
  
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, defaultContent, 'utf-8');
    }

}

export async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    return error;
  }
}

