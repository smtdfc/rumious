#!/usr/bin/env node
import path from 'path';
import { exec_command } from './utils/exec.js';

export const dev = async (argv) => {
  console.log('🚀 Initializing development environment...');
  
  let currentDir = process.cwd();
  
  console.log('🚀 Bundling the application...');
  const code = await exec_command(`rollup -c ./rollup.configs.mjs ${argv.watch ? '--watch' : ''}`, {
    cwd: path.join(currentDir),
    showLog: true,
    showErr: true
  });
  
  
  if (code !== 0) {
    console.error(`🚨 Process exited with error code ${code}`);
  } else {
    console.log('✅ Bundling completed successfully!');
  }
  
};

export const prod = async () => {
  console.log('🚀 Preparing production environment... ');
  let currentDir = process.cwd();
  
  console.log('🚀 Bundling the application...');
  const code = await exec_command('NODE_ENV=production rollup -c ./rollup.configs.mjs ', {
    cwd: path.join(currentDir),
    showLog: true,
    showErr: true
  });
  
  if (code !== 0) {
    console.error(`🚨 Process exited with error code ${code}`);
  } else {
    console.log('✅ Bundling completed successfully!');
  }
};