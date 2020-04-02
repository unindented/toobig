import { endOutputStream, getOutputContext, getOutputStream } from "../shared";
import { OutputContext, OutputStream, Reporter, Result } from "../types";

import {
  formatPath,
  formatSizeVsMaxSize,
  isOverBudget,
  supportsColor,
} from "./shared";

export interface SummaryReporterOptions {
  color?: boolean;
  output?: string | NodeJS.WritableStream;
}

export default class SummaryReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({
    color = !!supportsColor,
    output = "stdout",
  }: SummaryReporterOptions = {}) {
    this.outputContext = getOutputContext(color);
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {
    return;
  }

  public onResult(): void {
    return;
  }

  public onRunComplete(results: Result[]): void {
    const { colors } = this.outputContext;

    const resultsOverMaxSize = results.filter(isOverBudget);

    if (resultsOverMaxSize.length === 0) {
      return;
    }

    const header = colors.bold("Summary");
    const summary = colors.bold.red(
      `${arrow}${resultsOverMaxSize.length.toString()} ${
        resultsOverMaxSize.length === 1 ? "entry" : "entries"
      } over budget`
    );
    const details = getDetails(resultsOverMaxSize, this.outputContext);

    this.outputStream.write(
      [header, summary, ...details, ""].join("\n") + "\n"
    );
    endOutputStream(this.outputStream);
  }
}

const arrow = " \u203A ";
const downArrow = " \u21B3 ";
const dot = " \u2022 ";

const getDetails = (
  results: Result[],
  outputContext: OutputContext
): string[] => {
  const detailsContext = {
    colors: outputContext.colors,
    colorOverride: outputContext.colors.dim,
  };
  return results.reduce<string[]>((acc, result, index) => {
    const prefix = `  ${index === 0 ? downArrow : "   "} ${dot}`;
    const path = formatPath(result, outputContext);
    const size = formatSizeVsMaxSize(result, detailsContext);
    acc.push(`${prefix}${path} ${size}`);
    return acc;
  }, []);
};
