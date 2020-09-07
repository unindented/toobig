import { resolve as resolvePath } from "path";

import bytes from "bytes";
import glob from "fast-glob";
import getFolderSize from "get-folder-size";

import { scanConfigSchema } from "../schemas";
import {
  BudgetsConfig,
  Entry,
  Results,
  ReturnValues,
  ScanConfig,
  WritableEntries,
} from "../types";

import {
  getCompositeReporter,
  getReturnValues,
  loadResults,
  reportResults,
} from "./shared";

export const scanAndReport = async (
  config: ScanConfig
): Promise<ReturnValues> => {
  await scanConfigSchema.validateAsync(config);

  const {
    projectDir = process.cwd(),
    budgets,
    baselines,
    reporters = ["default"],
  } = config;
  const compositeReporter = getCompositeReporter(reporters);

  const scannedResults = await scanResults({ projectDir, budgets });
  const baselineResults = baselines
    ? await loadResults({ results: baselines })
    : undefined;
  await reportResults({
    results: scannedResults,
    baselines: baselineResults,
    reporter: compositeReporter,
  });

  return getReturnValues({
    results: scannedResults,
    baselines: baselineResults,
  });
};

const scanResults = async ({
  projectDir,
  budgets,
}: {
  projectDir: string;
  budgets: BudgetsConfig;
}): Promise<Results> => {
  const entries: WritableEntries = {};

  for (const budget of Object.keys(budgets)) {
    const maxSize = bytes(budgets[budget]);
    const paths = await glob(budget, { cwd: projectDir, onlyFiles: false });

    for (const path of paths) {
      const entry: Entry = {
        path: path.toString(),
        size: await getSize(resolvePath(projectDir, path.toString())),
        maxSize,
      };

      if (entries[path] === undefined || entries[path].maxSize > maxSize) {
        entries[path] = entry;
      }
    }
  }

  return entries;
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
