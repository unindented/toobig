import fromPairs from "lodash/fromPairs";
import { Argv } from "yargs";

import { scanAndReport } from "../commands/scan";
import { ScanConfig } from "../types";

import { configParser } from "./shared";

const pkg = require("../../package.json") as { homepage: string };

export const command = ["scan [options]", "$0"];

export const describe =
  "Scan current working directory to check for entries over budget, and report them";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const builder = (yargs: Argv): Argv<any> =>
  yargs
    .option("budgets", {
      describe: "Budgets to apply when scanning",
      type: "array",
      required: true,
    })
    .coerce("budgets", coerceBudgets)
    .option("cwd", {
      describe: "Current working directory to scan",
      type: "string",
      default: ".",
      normalize: true,
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
    .group(
      ["budgets", "cwd", "baselines", "reporters", "config"],
      "Command options:"
    )
    .example("$0 scan", "")
    .example("$0 scan --config myconfig.json", "")
    .example('$0 scan --budgets "dist/*.js" 4KB --budgets "dist/*.css" 2KB', "")
    .example("$0 scan --reporters table summary", "")
    .example("$0 scan --reporters json | $0 load", "")
    .epilogue(`For more details, please see: ${pkg.homepage}`);

export const handler = async (argv: ScanConfig): Promise<boolean> => {
  const { anyOverBudget } = await scanAndReport(argv);
  return anyOverBudget;
};

type ParsedArray = object[] | string[] | string[][];

// istanbul ignore next
const coerceBudgets = (budgets: ParsedArray): object =>
  isNestedStringArray(budgets)
    ? fromPairs(budgets)
    : isStringArray(budgets)
    ? fromPairs([budgets])
    : isObjectArray(budgets)
    ? budgets[0]
    : budgets;

function isNestedStringArray(arr: ParsedArray): arr is string[][] {
  return Array.isArray(arr) && Array.isArray(arr[0]);
}

function isStringArray(arr: ParsedArray): arr is string[] {
  return Array.isArray(arr) && typeof arr[0] === "string";
}

function isObjectArray(arr: ParsedArray): arr is object[] {
  return Array.isArray(arr) && typeof arr[0] === "object";
}
