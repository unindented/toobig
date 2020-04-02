import {
  TableBorder,
  TableBorderTemplate,
  TableUserConfig,
  getBorderCharacters as getBorderCharactersBuiltin,
  table,
} from "table";

import { endOutputStream, getOutputContext, getOutputStream } from "../shared";
import { OutputContext, OutputStream, Reporter, Result } from "../types";

import {
  formatMaxSize,
  formatPath,
  formatSize,
  formatTotalSize,
  isOverBudget,
  supportsColor,
} from "./shared";

export interface TableReporterOptions {
  template?: TableBorderTemplate | "jest" | "markdown";
  color?: boolean;
  output?: string | NodeJS.WritableStream;
}

export default class TableReporter implements Reporter {
  private readonly userConfig: TableUserConfig;
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({
    template = "jest",
    color = !!supportsColor,
    output = "stdout",
  }: TableReporterOptions = {}) {
    const userConfig: TableUserConfig = {
      border: getBorderCharacters(template),
      drawHorizontalLine: (index, size) =>
        index === 0 ||
        index === 1 ||
        (template !== "markdown" && index === size - 1) ||
        index === size,
    };

    this.userConfig = userConfig;
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
    const bold = (str: string): string => colors.bold(str);

    const header = ["Path", "Size", "Max Size", " "].map(bold);
    const body = results.map((result) => [
      formatPath(result, this.outputContext),
      formatSize(result),
      formatMaxSize(result),
      getCheckmark(result, this.outputContext),
    ]);
    const footer = ["", formatTotalSize(results), "", ""].map(bold);

    this.outputStream.write(
      table([header, ...body, footer], this.userConfig) + "\n"
    );
    endOutputStream(this.outputStream);
  }
}

const failMark = "\u2717";
const passMark = "\u2713";

const getCheckmark = (result: Result, { colors }: OutputContext): string =>
  isOverBudget(result) ? colors.red(failMark) : colors.green(passMark);

const jestTemplate: TableBorder = {
  topBody: "-",
  topJoin: "|",
  topLeft: "",
  topRight: "",
  bottomBody: "-",
  bottomJoin: "|",
  bottomLeft: "",
  bottomRight: "",
  bodyLeft: "",
  bodyRight: "",
  bodyJoin: "|",
  joinBody: "-",
  joinLeft: "",
  joinRight: "",
  joinJoin: "|",
};

const markdownTemplate: TableBorder = {
  topBody: "",
  topJoin: "",
  topLeft: "",
  topRight: "",
  bottomBody: "",
  bottomJoin: "",
  bottomLeft: "",
  bottomRight: "",
  bodyLeft: "|",
  bodyRight: "|",
  bodyJoin: "|",
  joinBody: "-",
  joinLeft: "|",
  joinRight: "|",
  joinJoin: "|",
};

const getBorderCharacters = (
  template: Required<TableReporterOptions>["template"]
): TableBorder =>
  template === "jest"
    ? jestTemplate
    : template === "markdown"
    ? markdownTemplate
    : getBorderCharactersBuiltin(template);
