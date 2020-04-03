import { loadConfigSchema } from "../schemas";
import { getInputStream, isOverBudget, readInputStream } from "../shared";
import { LoadConfig, Results, ReturnValue } from "../types";

import { getCompositeReporter, reportResults } from "./shared";

export const loadAndReport = async (
  config: LoadConfig
): Promise<ReturnValue> => {
  await loadConfigSchema.validateAsync(config);

  const { input, reporters = ["default"] } = config;
  const compositeReporter = getCompositeReporter(reporters);

  const results = await loadResults({ input });
  await reportResults({ results, reporter: compositeReporter });

  const anyOverBudget = Object.values(results).some(isOverBudget);
  return { results, anyOverBudget };
};

const loadResults = async ({
  input,
}: {
  input: string | Results;
}): Promise<Results> => {
  if (typeof input !== "string") {
    return input;
  }

  const stream = await getInputStream(input);
  const contents = await readInputStream(stream);
  return JSON.parse(contents) as Results;
};
