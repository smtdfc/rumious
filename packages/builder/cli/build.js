#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';

function importJson(filePath) {
  const fullPath = path.resolve(filePath);
  const rawData = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(rawData);
}

export const dev = async (argv) => {
  console.log(`🚀 Initializing development environment...`);

  let currentDir = process.env.PWD;
  let configs;

  // Load configuration from rumious.configs.json
  try {
    configs = importJson(path.join(currentDir, 'rumious.configs.json'), {  type: 'json' });
    console.log("✅ Configuration loaded successfully.");
  } catch (error) {
    console.error("🚨 Failed to load configuration: ", error);
    return;
  }

  // Determine entry point and output directory from configuration
  let outputDir = path.join(currentDir, configs.outputDir ?? "dist");

  console.log(`🚀 Bundling the application...`);
  const task = exec(`rollup -c ./rollup.configs.mjs ${argv.watch ? "--watch" : ""}`, { cwd: path.join(currentDir) });

  // Output Rollup process stdout
  task.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  // Output Rollup process stderr
  task.stderr.on('data', (data) => {
    console.error(`${data}`);
  });

  task.on('close', (code) => {
    if (code !== 0) {
      console.error(`🚨 Process exited with error code ${code}`);
    } else {
      console.log('✅ Bundling completed successfully!');
    }
  });
};

export const prod = async () => {
  console.log("🚀 Preparing production environment... ");
  let currentDir = process.env.PWD;
  let configs;

  // Load configuration from rumious.configs.json
  try {
    configs = importJson(path.join(currentDir, 'rumious.configs.json'), { assert: { type: 'json' } });
    console.log("✅ Configuration loaded successfully.");
  } catch (error) {
    console.error("🚨 Failed to load configuration: ", error);
    return;
  }

  // Determine entry point and output directory from configuration
  let outputDir = path.join(currentDir, configs.outputDir ?? "dist");

  console.log(`🚀 Bundling the application...`);
  const task = exec(`rollup -c ./rollup.configs.mjs --mode=prod`, { cwd: path.join(currentDir) });

  // Output Rollup process stdout
  task.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  // Output Rollup process stderr
  task.stderr.on('data', (data) => {
    console.error(`${data}`);
  });

  task.on('close', (code) => {
    if (code !== 0) {
      console.error(`🚨 Process exited with error code ${code}`);
    } else {
      console.log('✅ Bundling completed successfully!');
    }
  });
};