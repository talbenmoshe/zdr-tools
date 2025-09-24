import { program } from 'commander';
import { start } from './start';

program
  .command('start')
  .description('Start monorepo libraries')
  .requiredOption('-e, --entries <entries>', 'Entry points for the monorepo')
  .option('-t, --timeout <timeout>', 'How long to wait for the files to be ready', '10000')
  .action(start);

program.parseAsync();