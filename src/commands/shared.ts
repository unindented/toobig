import { CompositeReporter } from "../reporters";
import {
  Reporter,
  ReporterConfig,
  ReporterConstructor,
  Results,
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

export const reportResults = async ({
  results,
  reporter,
}: {
  results: Results;
  reporter: Reporter;
}): Promise<void> => {
  await reporter.onRunStart();

  for (const result of Object.values(results)) {
    await reporter.onResult(result);
  }

  await reporter.onRunComplete(results);
};
