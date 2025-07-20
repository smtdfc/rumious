import { cac } from 'cac';
import * as commands from './commands/index.js';

const cli = cac('rumious');

cli
  .command('dev', 'Watch and rebuild on file changes (no server)')
  .action(() => commands.dev());

cli
  .command('prod', 'Compile and bundle the app for production')
  .action(() => commands.prod());

cli
  .command('typecheck', 'Run TypeScript type checking (tsc --noEmit)')
  .action(() => commands.typecheck());

cli.parse();

if (!cli.matchedCommand) {
  cli.outputHelp();
}