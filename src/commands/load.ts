import { loadConfigSchema } from "../schemas";
import { isOverBudget } from "../shared";
import { LoadConfig, ReturnValue } from "../types";

import { getCompositeReporter, loadResults, reportResults } from "./shared";

export const loadAndReport = async (
  config: LoadConfig
): Promise<ReturnValue> => {
  await loadConfigSchema.validateAsync(config);

  const { results, baselines, reporters = ["default"] } = config;
  const compositeReporter = getCompositeReporter(reporters);

  const loadedResults = await loadResults({ results });
  const baselineResults = baselines
    ? await loadResults({ results: baselines })
    : undefined;
  await reportResults({
    results: loadedResults,
    baselines: baselineResults,
    reporter: compositeReporter,
  });

  const anyOverBudget = Object.values(loadedResults).some(isOverBudget);
  return { results: loadedResults, anyOverBudget };
};
