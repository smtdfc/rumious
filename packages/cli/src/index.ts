import { cac } from 'cac';
import * as commands from './commands/index.js';

const cli = cac('rumious');

cli
  .option('--no-install', "Do not automatically install packages using npm")
  .command('init', 'Create new project ')
  .action((options) => commands.init(options));

cli
  .command('dev', 'Watch and rebuild on file changes (no server)')
  .action(() => commands.dev());

cli
  .command('prod', 'Compile and bundle the app for production')
  .action(() => commands.prod());

cli
  .command('typecheck', 'Run TypeScript type checking (tsc --noEmit)')
  .action(() => commands.typecheck());

cli
  .command('gen <type> <name>', 'Create components/router')
  .action((itemType,name) => commands.gen(itemType,name));

cli.parse();

if (!cli.matchedCommand) {
  cli.outputHelp();
}
