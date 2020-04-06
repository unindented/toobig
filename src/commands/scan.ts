import { resolve as resolvePath } from "path";

import bytes from "bytes";
import glob from "fast-glob";
import getFolderSize from "get-folder-size";

import { scanConfigSchema } from "../schemas";
import { isOverBudget } from "../shared";
import {
  BudgetsConfig,
  Result,
  Results,
  ReturnValue,
  ScanConfig,
  WritableResults,
} from "../types";

import { getCompositeReporter, loadResults, reportResults } from "./shared";

export const scanAndReport = async (
  config: ScanConfig
): Promise<ReturnValue> => {
  await scanConfigSchema.validateAsync(config);

  const {
    budgets,
    cwd = process.cwd(),
    baselines,
    reporters = ["default"],
  } = config;
  const compositeReporter = getCompositeReporter(reporters);

  const scannedResults = await scanResults({ budgets, cwd });
  const baselineResults = baselines
    ? await loadResults({ results: baselines })
    : undefined;
  await reportResults({
    results: scannedResults,
    baselines: baselineResults,
    reporter: compositeReporter,
  });

  const anyOverBudget = Object.values(scannedResults).some(isOverBudget);
  return { results: scannedResults, anyOverBudget };
};

const scanResults = async ({
  budgets,
  cwd,
}: {
  budgets: BudgetsConfig;
  cwd: string;
}): Promise<Results> => {
  const results: WritableResults = {};

  for (const budget of Object.keys(budgets)) {
    const maxSize = bytes(budgets[budget]);
    const paths = await glob(budget, { cwd, onlyFiles: false });

    for (const path of paths) {
      const result: Result = {
        path: path.toString(),
        size: await getSize(resolvePath(cwd, path.toString())),
        maxSize,
      };

      if (results[path] === undefined || results[path].maxSize > maxSize) {
        results[path] = result;
      }
    }
  }

  return results;
};

const getSize = (path: string): Promise<number> =>
  new Promise((resolve, reject) => {
    getFolderSize(path, (err, size) => {
      if (err !== null) {
        reject(err);
        return;
      }
      resolve(size);
    });
  });
