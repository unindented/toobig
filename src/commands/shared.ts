import { CompositeReporter } from "../reporters";
import {
  filterResults,
  getInputStream,
  isOverBaseline,
  isOverBudget,
  isUnderBaseline,
  readInputStream,
} from "../shared";
import {
  Reporter,
  ReporterConfig,
  ReporterConstructor,
  Results,
  ReturnValues,
} from "../types";

export const getCompositeReporter = (
  configReporters: readonly ReporterConfig[]
): Reporter => {
  const reporters = configReporters.map((configReporter) => {
    let reporter: Reporter;

    if (typeof configReporter === "string") {
      const ReporterClass = resolveReporter(configReporter);
      reporter = new ReporterClass();
    } else {
      const ReporterClass = resolveReporter(configReporter[0]);
      reporter = new ReporterClass(configReporter[1]);
    }

    return reporter;
  });

  return new CompositeReporter({ reporters });
};

const resolveReporter = (reporterName: string): ReporterConstructor => {
  let module: { default: ReporterConstructor };

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    module = require(`../reporters/${reporterName}`);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    module = require(reporterName);
  }

  return module.default;
};

export const loadResults = async ({
  results,
}: {
  results: string | Results;
}): Promise<Results> => {
  if (typeof results !== "string") {
    return results;
  }

  const stream = await getInputStream(results);
  const contents = await readInputStream(stream);
  return JSON.parse(contents) as Results;
};

export const reportResults = async ({
  results,
  baselines,
  reporter,
}: {
  results: Results;
  baselines?: Results;
  reporter: Reporter;
}): Promise<void> => {
  await reporter.onRunStart();

  for (const result of Object.values(results)) {
    await reporter.onResult(
      result,
      baselines ? baselines[result.path] : undefined
    );
  }

  await reporter.onRunComplete(results, baselines);
};

export const getReturnValues = ({
  results,
  baselines,
}: {
  results: Results;
  baselines?: Results;
}): ReturnValues => {
  const resultsUnderBaseline = filterResults(
    results,
    isUnderBaseline(baselines)
  );
  const resultsOverBaseline = filterResults(results, isOverBaseline(baselines));
  const resultsOverBudget = filterResults(results, isOverBudget);

  const anyUnderBaseline = Object.keys(resultsUnderBaseline).length > 0;
  const anyOverBaseline = Object.keys(resultsOverBaseline).length > 0;
  const anyOverBudget = Object.keys(resultsOverBudget).length > 0;

  return {
    results,
    anyUnderBaseline,
    anyOverBaseline,
    anyOverBudget,
  };
};
