import template from "lodash/template";

import {
  endOutputStream,
  getOutputContext,
  getOutputStream,
  isOverBudget,
} from "../shared";
import { OutputContext, OutputStream, Reporter, Results } from "../types";

import { formatSizeVsMaxSize } from "./shared";

export interface TAPReporterOptions {
  readonly output?: string | NodeJS.WritableStream;
}

export default class TAPReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({ output = "stdout" }: TAPReporterOptions = {}) {
    this.outputContext = getOutputContext({ supportsColor: false });
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {}

  public onResult(): void {}

  public onRunComplete(results: Results): void {
    const values = Object.values(results);
    const valuesOverBudget = values.filter(isOverBudget);

    if (values.length === 0) {
      return;
    }

    const data = {
      totalCount: values.length,
      failedCount: valuesOverBudget.length,
      results: values.map((result) => ({
        ...result,
        isOverBudget: isOverBudget(result),
        message: formatSizeVsMaxSize({
          result,
          outputContext: this.outputContext,
        }),
      })),
    };
    const output = contentTemplate(data);
    const outputWithoutEmptyLines = output.replace(/^\s*[\n\r]/gmu, "");

    this.outputStream.write(outputWithoutEmptyLines);
    endOutputStream(this.outputStream);
  }
}

const contentTemplate = template(`1..<%= totalCount %>
<% results.forEach((result, index) => { %>
<%= result.isOverBudget ? 'not ' : '' %>ok <%= index + 1 %> - <%= result.message %>
<% }) %>
`);
