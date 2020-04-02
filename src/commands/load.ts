import { loadConfigSchema } from "../schemas";
import { getInputStream, isOverBudget } from "../shared";
import { LoadConfig, Result, ReturnValue } from "../types";

import { getCompositeReporter, reportResults } from "./shared";

export const loadAndReport = async (
  config: LoadConfig
): Promise<ReturnValue> => {
  await loadConfigSchema.validateAsync(config);

  const { input, reporters = ["default"] } = config;
  const compositeReporter = getCompositeReporter(reporters);

  const results = await loadResults({ input });
  await reportResults({ results, reporter: compositeReporter });

  const anyOverBudget = results.some(isOverBudget);
  return { results, anyOverBudget };
};

const loadResults = async ({
  input,
}: {
  input: string | Result[];
}): Promise<Result[]> => {
  if (typeof input !== "string") {
    return input;
  }

  const stream = await getInputStream(input);

  return new Promise((resolve, reject) => {
    const contents: string[] = [];

    stream.on("data", (data: string | Buffer) => {
      contents.push(data.toString());
    });

    stream.on("end", () => {
      resolve(JSON.parse(contents.join("")) as Result[]);
    });

    stream.on("error", (error: Error) => {
      reject(error);
    });
  });
};
