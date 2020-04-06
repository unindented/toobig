import {
  endOutputStream,
  filterResults,
  getOutputContext,
  getOutputStream,
  isOverBaseline,
  isOverBudget,
  isUnderBaseline,
  supportsColor,
} from "../shared";
import {
  OutputContext,
  OutputStream,
  Reporter,
  ResultContext,
  Results,
  ResultsContext,
} from "../types";

import {
  formatPath,
  formatSizeVsBaselineSize,
  formatSizeVsMaxSize,
} from "./shared";

export interface SummaryReporterOptions {
  readonly color?: boolean;
  readonly output?: string | NodeJS.WritableStream;
}

export default class SummaryReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({
    color = Boolean(supportsColor),
    output = "stdout",
  }: SummaryReporterOptions = {}) {
    this.outputContext = getOutputContext({ supportsColor: color });
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {}

  public onResult(): void {}

  public onRunComplete(results: Results, baselines?: Results): void {
    const { colors } = this.outputContext;

    const resultsUnderBaseline = filterResults(
      results,
      isUnderBaseline(baselines)
    );
    const resultsOverBaseline = filterResults(
      results,
      isOverBaseline(baselines)
    );
    const resultsOverBudget = filterResults(results, isOverBudget);

    const totalResultsUnderBaseline = Object.keys(resultsUnderBaseline).length;
    const totalResultsOverBaseline = Object.keys(resultsOverBaseline).length;
    const totalResultsOverBudget = Object.keys(resultsOverBudget).length;

    if (
      totalResultsUnderBaseline === 0 &&
      totalResultsOverBaseline === 0 &&
      totalResultsOverBudget === 0
    ) {
      return;
    }

    const header = colors.bold("Summary");
    const underBaselineSummary = getUnderBaselineSummary({
      results: resultsUnderBaseline,
      baselines,
      outputContext: this.outputContext,
    });
    const overBaselineSummary = getOverBaselineSummary({
      results: resultsOverBaseline,
      baselines,
      outputContext: this.outputContext,
    });
    const overBudgetSummary = getOverBudgetSummary({
      results: resultsOverBudget,
      outputContext: this.outputContext,
    });
    const output = [
      header,
      ...underBaselineSummary,
      ...overBaselineSummary,
      ...overBudgetSummary,
      "",
    ].join("\n");

    this.outputStream.write(output + "\n");
    endOutputStream(this.outputStream);
  }
}

const arrow = " \u203A ";
const downArrow = " \u21B3 ";
const dot = " \u2022 ";

const getUnderBaselineSummary = (
  context: ResultsContext
): readonly string[] => {
  const {
    results,
    outputContext: { colors },
  } = context;

  const totalResultsUnderBaseline = Object.keys(results).length;

  if (totalResultsUnderBaseline === 0) {
    return [];
  }

  // istanbul ignore next
  const summary = colors.bold.green(
    `${arrow}${totalResultsUnderBaseline.toString()} ${
      totalResultsUnderBaseline === 1 ? "entry" : "entries"
    } under baseline`
  );

  return [summary, ...getSummaryLines(formatSizeVsBaselineSize, context)];
};

const getOverBaselineSummary = (context: ResultsContext): readonly string[] => {
  const {
    results,
    outputContext: { colors },
  } = context;

  const totalResultsOverBaseline = Object.keys(results).length;

  if (totalResultsOverBaseline === 0) {
    return [];
  }

  // istanbul ignore next
  const summary = colors.bold.yellow(
    `${arrow}${totalResultsOverBaseline.toString()} ${
      totalResultsOverBaseline === 1 ? "entry" : "entries"
    } over baseline`
  );

  return [summary, ...getSummaryLines(formatSizeVsBaselineSize, context)];
};

const getOverBudgetSummary = (context: ResultsContext): readonly string[] => {
  const {
    results,
    outputContext: { colors },
  } = context;

  const totalResultsOverBudget = Object.keys(results).length;

  if (totalResultsOverBudget === 0) {
    return [];
  }

  const summary = colors.bold.red(
    `${arrow}${totalResultsOverBudget.toString()} ${
      totalResultsOverBudget === 1 ? "entry" : "entries"
    } over budget`
  );

  return [summary, ...getSummaryLines(formatSizeVsMaxSize, context)];
};

const getSummaryLines = (
  metadataFunc: (context: ResultContext) => string,
  { results, baselines, outputContext }: ResultsContext
): string[] => {
  const { colors } = outputContext;
  const dimOutputContext = {
    ...outputContext,
    colorOverride: colors.dim,
  };

  return Object.values(results).reduce<string[]>((acc, result, index) => {
    const resultContext = { result, outputContext };
    const detailsContext = {
      result,
      baseline: baselines ? baselines[result.path] : undefined,
      outputContext: dimOutputContext,
    };

    const prefix = `  ${index === 0 ? downArrow : "   "} ${dot}`;
    const path = formatPath(resultContext);
    const size = metadataFunc(detailsContext);

    acc.push(`${prefix}${path} ${size}`);
    return acc;
  }, []);
};
