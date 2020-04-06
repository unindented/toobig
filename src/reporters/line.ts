import {
  endOutputStream,
  getOutputContext,
  getOutputStream,
  isOverBudget,
  supportsColor,
} from "../shared";
import {
  OutputContext,
  OutputStream,
  Reporter,
  Result,
  ResultContext,
} from "../types";

import { formatSizeVsMaxSize, linkPath } from "./shared";

export interface LineReporterOptions {
  readonly color?: boolean;
  readonly output?: string | NodeJS.WritableStream;
}

export default class LineReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({
    color = Boolean(supportsColor),
    output = "stdout",
  }: LineReporterOptions = {}) {
    this.outputContext = getOutputContext({ supportsColor: color });
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {}

  public onResult(result: Result): void {
    const resultContext = { result, outputContext: this.outputContext };

    const header = getHeader(resultContext);
    const path = linkPath(resultContext);
    const size = formatSizeVsMaxSize(resultContext);

    this.outputStream.write(`${header} ${path} ${size}\n`);
  }

  public onRunComplete(): void {
    this.outputStream.write("\n");
    endOutputStream(this.outputStream);
  }
}

const failText = "FAIL";
const passText = "PASS";

const getFailHeader = ({ colors }: OutputContext): string =>
  colors.level > 0 ? colors.reset.inverse.bold.red(` ${failText} `) : failText;

const getPassHeader = ({ colors }: OutputContext): string =>
  colors.level > 0
    ? colors.reset.inverse.bold.green(` ${passText} `)
    : passText;

const getHeader = ({ result, outputContext }: ResultContext): string =>
  isOverBudget(result)
    ? getFailHeader(outputContext)
    : getPassHeader(outputContext);
