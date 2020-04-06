import { Argv } from "yargs";

import { loadAndReport } from "../commands/load";
import { LoadConfig } from "../types";

import { configParser } from "./shared";

const pkg = require("../../package.json") as { homepage: string };

export const command = "load [options]";

export const describe = "Load results from a file, and report them";

const isResultsRequired = Boolean(process.stdin.isTTY);
// istanbul ignore next
const resultsDefault = !isResultsRequired ? "stdin" : undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const builder = (yargs: Argv): Argv<any> =>
  yargs
    .option("results", {
      describe: "Results file (path or URL)",
      type: "string",
      required: isResultsRequired,
      default: resultsDefault,
    })
    .option("baselines", {
      describe: "Baseline results file (path or URL)",
      type: "string",
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
    .group(["results", "baselines", "reporters", "config"], "Command options:")
    .example("$0 load --results results.json", "")
    .example("$0 load --results results.json --config myconfig.json", "")
    .example("$0 load --results results.json --reporters table summary", "")
    .example("$0 load < results.json", "")
    .example("$0 scan --reporters json | $0 load", "")
    .epilogue(`For more details, please see: ${pkg.homepage}`);

export const handler = async (argv: LoadConfig): Promise<boolean> => {
  const { anyOverBudget } = await loadAndReport(argv);
  return anyOverBudget;
};
