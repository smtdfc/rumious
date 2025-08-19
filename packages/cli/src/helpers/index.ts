import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

export function readJSON<T = any>(path: string): T {
  try {
    const fullPath = resolve(path);
    const content = readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    throw new Error(`Cannot read file ${path}: ${(err as Error).message}`);
  }
}

export function renderTemplateToFile(
  templatePath: string,
  data: Record<string, any>,
  outputPath: string,
) {
  const template = readFileSync(templatePath, 'utf8');
  const content = renderTemplate(template, data);
  const dir = dirname(outputPath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(outputPath, content, 'utf8');
}

export function renderTemplate(
  template: string,
  data: Record<string, any>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return data[key] != null ? String(data[key]) : '';
  });
}

export function camelToPascal(str: string): string {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1);
}
