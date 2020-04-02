import { resolve } from "path";

import bytes from "bytes";
import glob from "fast-glob";
import getFolderSize from "get-folder-size";

import { scanConfigSchema } from "../schemas";
import { isOverBudget } from "../shared";
import { BudgetsConfig, Result, ReturnValue, ScanConfig } from "../types";

import { getCompositeReporter, reportResults } from "./shared";

export const scanAndReport = async (
  config: ScanConfig
): Promise<ReturnValue> => {
  await scanConfigSchema.validateAsync(config);

  const { budgets, cwd = process.cwd(), reporters = ["default"] } = config;
  const compositeReporter = getCompositeReporter(reporters);

  const results = await scanResults({ budgets, cwd });
  await reportResults({ results, reporter: compositeReporter });

  const anyOverBudget = results.some(isOverBudget);
  return { results, anyOverBudget };
};

const scanResults = async ({
  budgets,
  cwd,
}: {
  budgets: BudgetsConfig;
  cwd: string;
}): Promise<Result[]> => {
  const results: Result[] = [];

  for (const budget of Object.keys(budgets)) {
    const maxSize = bytes(budgets[budget]);
    const paths = await glob(budget, { cwd, onlyFiles: false });

    for (const path of paths) {
      const result = {
        path: path.toString(),
        size: await getSize(resolve(cwd, path.toString())),
        maxSize,
      };

      results.push(result);
    }
  }

  return results;
};

const getSize = (path: string): Promise<number> =>
  new Promise((resolve, reject) => {
    getFolderSize(path, (err, size) => {
      if (err != null) {
        reject(err);
        return;
      }
      resolve(size);
    });
  });
