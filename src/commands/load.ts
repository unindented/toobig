import { loadConfigSchema } from "../schemas";
import { LoadConfig, ReturnValues } from "../types";

import {
  getCompositeReporter,
  getReturnValues,
  loadResults,
  reportResults,
} from "./shared";

export const loadAndReport = async (
  config: LoadConfig
): Promise<ReturnValues> => {
  await loadConfigSchema.validateAsync(config);

  const { results, baselines, reporters = ["default"] } = config;
  const compositeReporter = getCompositeReporter(reporters);

  const loadedResults = await loadResults({ results });
  const baselineResults = baselines
    ? await loadResults({ results: baselines })
    : undefined;
  const context = {
    results: loadedResults,
    baselines: baselineResults,
    reporter: compositeReporter,
  };
  await reportResults(context);

  return getReturnValues({
    results: loadedResults,
    baselines: baselineResults,
  });
};
