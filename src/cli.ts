#!/usr/bin/env node

import * as yargs from "yargs";

import tooBig from ".";

const argv = yargs
  .option("config", {
    describe: "Path to config file",
    type: "string",
  })
  .option("quiet", {
    describe: "Suppress standard output",
    type: "boolean",
  })
  .usage("Usage: $0 [--config=<pathToConfigFile>]")
  .help()
  .wrap(null).argv;

(async () => {
  try {
    await tooBig({
      config: argv.config,
      quiet: argv.quiet,
    });
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err.message);
    process.exit(1);
  }
})();
