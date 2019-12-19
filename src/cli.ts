#!/usr/bin/env node

import * as yargs from 'yargs';

import tooBig from '.';

const argv = yargs
  .option('config', {
    describe: 'Path to config file',
    type: 'string',
  })
  .option('quiet', {
    describe: 'Suppress standard output',
    type: 'boolean',
  })
  .option('json', {
    describe: 'Output results to a JSON file',
    type: 'string',
  })
  .usage(
    'Usage: $0 [--config=<pathToConfigFile>] [--quiet] [--json=<pathToResultsFile>]'
  )
  .help()
  .wrap(null).argv;

(async () => {
  try {
    await tooBig({
      config: argv.config,
      quiet: argv.quiet,
      json: argv.json,
    });
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err.message);
    process.exit(1);
  }
})();
