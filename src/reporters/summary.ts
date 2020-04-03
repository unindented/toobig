import { endOutputStream, getOutputContext, getOutputStream } from "../shared";
import {
  OutputContext,
  OutputStream,
  Reporter,
  Result,
  Results,
} from "../types";

import {
  formatPath,
  formatSizeVsMaxSize,
  isOverBudget,
  supportsColor,
} from "./shared";

export interface SummaryReporterOptions {
  readonly color?: boolean;
  readonly output?: string | NodeJS.WritableStream;
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

  public onRunComplete(results: Results): void {
    const { colors } = this.outputContext;

    const values = Object.values(results);
    const valuesOverBudget = values.filter(isOverBudget);

    if (valuesOverBudget.length === 0) {
      return;
    }

    const header = colors.bold("Summary");
    const summary = colors.bold.red(
      `${arrow}${valuesOverBudget.length.toString()} ${
        valuesOverBudget.length === 1 ? "entry" : "entries"
      } over budget`
    );
    const details = getDetails(valuesOverBudget, this.outputContext);

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
  results: readonly Result[],
  outputContext: OutputContext
): readonly string[] => {
  const detailsContext: OutputContext = {
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
