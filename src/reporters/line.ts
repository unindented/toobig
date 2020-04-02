import { endOutputStream, getOutputContext, getOutputStream } from "../shared";
import { OutputContext, OutputStream, Reporter, Result } from "../types";

import {
  formatSizeVsMaxSize,
  isOverBudget,
  linkPath,
  supportsColor,
} from "./shared";

export interface LineReporterOptions {
  color?: boolean;
  output?: string | NodeJS.WritableStream;
}

export default class LineReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({
    color = !!supportsColor,
    output = "stdout",
  }: LineReporterOptions = {}) {
    this.outputContext = getOutputContext(color);
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {
    return;
  }

  public onResult(result: Result): void {
    const header = getHeader(result, this.outputContext);
    const path = linkPath(result, this.outputContext);
    const size = formatSizeVsMaxSize(result, this.outputContext);

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

const getHeader = (result: Result, outputContext: OutputContext): string =>
  isOverBudget(result)
    ? getFailHeader(outputContext)
    : getPassHeader(outputContext);
