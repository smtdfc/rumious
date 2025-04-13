#!/usr/bin/env ts-node

import { program } from 'commander';
import * as commands from "./commands/index.js";


async function main() {
  program
    .version('0.0.1')
    .description('Rumious CLI')
  
  program
    .command('init [name] ')
    .description('Create a rumious project')
    .action(commands.initCommand);
  
  program
    .command('generate <type> [name] ')
    .description('Generate application components ')
    .action(commands.generateCommand);
  
  program
    .command('build <mode>')
    .option('-w, --watch', 'Enable tracking mode')
    .description('Build application')
    .action(commands.buildCommand);
    
  program.on('command:*', () => {
    console.error('Invalid command. Use --help to see available commands');
    process.exit(1);
  });
  
  await program.parseAsync(process.argv);
  
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});