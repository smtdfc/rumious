#!/usr/bin/env node

import path from 'path';
import { exec } from 'child_process';



export const dev = async (argv) => {
  console.log('🚀 Initializing development environment...');

  let currentDir = process.env.PWD;
 

  console.log('🚀 Bundling the application...');
  const task = exec(`rollup -c ./rollup.configs.mjs ${argv.watch ? '--watch' : ''}`, { cwd: path.join(currentDir) });

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
  console.log('🚀 Preparing production environment... ');
  let currentDir = process.env.PWD;
  
  console.log('🚀 Bundling the application...');
  const task = exec('NODE_ENV=production rollup -c ./rollup.configs.mjs ', { cwd: path.join(currentDir) });

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