import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getWorkspacePackages() {
  const root = path.resolve(__dirname, '..');
  const pkgsDir = path.join(root, 'packages');

  const result = {};
  for (const dir of fs.readdirSync(pkgsDir)) {
    const pkgPath = path.join(pkgsDir, dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      result[pkgJson.name] = path.relative(
        __dirname,
        path.join(pkgsDir, dir, 'dist/index.js'),
      );
    }
  }
  return result;
}
