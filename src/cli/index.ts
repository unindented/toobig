#!/usr/bin/env node

import yargs from "yargs";

import * as loadCommand from "./load";
import * as scanCommand from "./scan";
import { parserConfiguration } from "./shared";

yargs
  .usage("Usage: $0 [command] [options]")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .command<any>(scanCommand)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .command<any>(loadCommand)
  .onFinishCommand((anyOverBudget: boolean) => {
    if (anyOverBudget) {
      throw new Error("Some entries are over budget");
    }
  })
  .fail((msg: string | null, error: Error) => {
    console.error(msg ?? error.message);
    process.exit(1);
  })
  .parserConfiguration(parserConfiguration)
  .parse();
