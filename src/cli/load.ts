import { Argv } from "yargs";

import { loadAndReport } from "../commands/load";
import { LoadConfig } from "../types";

import { configParser } from "./shared";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json") as { homepage: string };

export const command = "load [options]";

export const describe = "Load results from input file, and report them";

const isInputRequired = !!process.stdin.isTTY;
// istanbul ignore next
const inputDefault = !isInputRequired ? "stdin" : undefined;

export const builder = (yargs: Argv): Argv =>
  yargs
    .option("input", {
      describe: "Input file",
      type: "string",
      required: isInputRequired,
      default: inputDefault,
    })
    .option("reporters", {
      describe: "Reporters to process results",
      type: "array",
    })
    .option("config", {
      describe: "Config file, or directory to search for one",
      type: "string",
      default: ".",
      normalize: true,
      config: true,
      configParser,
    })
    .group(["input", "reporters", "config"], "Command options:")
    .example("$0 load results.json --reporters table summary", "")
    .example("$0 load --input results.json", "")
    .example("$0 load --input results.json --config myconfig.json", "")
    .example("$0 load --input results.json --reporters table summary", "")
    .example("$0 load < results.json", "")
    .example("$0 scan --reporters json | $0 load", "")
    .epilogue(`For more details, please see: ${pkg.homepage}`);

export const handler = async (argv: LoadConfig): Promise<boolean> => {
  const { anyOverBudget } = await loadAndReport(argv);
  return anyOverBudget;
};
