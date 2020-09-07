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
  MultiProjectResults,
  ProjectResults,
  Reporter,
  ReporterConfig,
  ReporterConstructor,
  Results,
  ReturnValues,
  isSimpleProjectResults,
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
    module = require(`../reporters/${reporterName}`);
  } catch (err) {
    module = require(reporterName);
  }

  return module.default;
};

export const loadResults = async ({
  results,
}: {
  results: string | ProjectResults;
}): Promise<ProjectResults> => {
  if (typeof results !== "string") {
    return results;
  }

  const stream = await getInputStream(results);
  const contents = await readInputStream(stream);
  return JSON.parse(contents) as ProjectResults;
};

export const reportResults = async ({
  results,
  baselines,
  reporter,
}: {
  results: ProjectResults;
  baselines?: ProjectResults;
  reporter: Reporter;
}): Promise<void> => {
  await reporter.onRunStart();

  const newResults: MultiProjectResults = isSimpleProjectResults(results)
    ? { projects: [results] }
    : results;
  const newBaselines: MultiProjectResults = baselines
    ? isSimpleProjectResults(baselines)
      ? { projects: [baselines] }
      : baselines
    : undefined;

  for (const result of Object.values(results.entries)) {
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
  results: ProjectResults;
  baselines?: ProjectResults;
}): ReturnValues => {
  const entriesUnderBaseline = filterResults(
    results,
    isUnderBaseline(baselines)
  );
  const entriesOverBaseline = filterResults(results, isOverBaseline(baselines));
  const entriesOverBudget = filterResults(results, isOverBudget);

  const anyUnderBaseline = Object.keys(entriesUnderBaseline).length > 0;
  const anyOverBaseline = Object.keys(entriesOverBaseline).length > 0;
  const anyOverBudget = Object.keys(entriesOverBudget).length > 0;

  return {
    results,
    anyUnderBaseline,
    anyOverBaseline,
    anyOverBudget,
  };
};
