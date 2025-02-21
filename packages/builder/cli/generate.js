#!/usr/bin/env node

import path from 'path';
import {
  ensureFileExists,
  checkFileExists,
  importJson,
  readFile
} from '../utils/files.js';

const cwd = process.cwd();

export const genComponent = async (argv) => {
  const componentName = argv.name;
  const templatePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../templates/files/component.jsx');
  const configFilePath = path.join(cwd, "rumious.configs.json");
  const configs = {
    source: cwd,
  }
  
  if (await checkFileExists(configFilePath)) {
    configs = await importJson(configFilePath);
  }
  
  const componentsFilePath = path.join(configs.source ?? cwd, `components/${componentName}.jsx`)
  await ensureFileExists(
    componentsFilePath,
    (await readFile(templatePath)).replace(`ExampleComponent`, `${componentName}`)
  );
  
};

export const genPage = async (argv) => {
  const pageName = argv.name;
  const templatePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../templates/files/page.jsx');
  const configFilePath = path.join(cwd, "rumious.configs.json");
  const configs = {
    source: cwd,
  }
  
  if (await checkFileExists(configFilePath)) {
    configs = await importJson(configFilePath);
  }
  
  const pagesFilePath = path.join(configs.source ?? cwd, `pages/${pageName}.jsx`)
  await ensureFileExists(
    pagesFilePath,
    await readFile(templatePath)
  );
};