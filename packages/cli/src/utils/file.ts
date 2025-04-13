import * as fs from 'fs';
import * as path from 'path';

export const ensureDirExist = (dirPath: string): void => {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
};

export const ensureFileExist = (filePath: string, content: string): void => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
};

export const ensureDirAndFileExist = (filePath: string, content: string): void => {
  const dirPath = path.dirname(filePath);
  ensureDirExist(dirPath);
  ensureFileExist(filePath, content);
};

