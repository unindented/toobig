import template from "lodash/template";

import { endOutputStream, getOutputContext, getOutputStream } from "../shared";
import { OutputContext, OutputStream, Reporter, Result } from "../types";

import { formatSizeVsMaxSize, isOverBudget } from "./shared";

export interface TAPReporterOptions {
  output?: string | NodeJS.WritableStream;
}

export default class TAPReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({ output = "stdout" }: TAPReporterOptions = {}) {
    this.outputContext = getOutputContext(false);
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {
    return;
  }

  public onResult(): void {
    return;
  }

  public onRunComplete(results: Result[]): void {
    if (results.length === 0) {
      return;
    }

    const data = {
      totalCount: results.length,
      failedCount: results.filter(isOverBudget).length,
      results: results.map((result) => ({
        ...result,
        isOverBudget: isOverBudget(result),
        message: formatSizeVsMaxSize(result, this.outputContext),
      })),
    };
    const output = contentTemplate(data);
    const outputWithoutEmptyLines = output.replace(/^\s*[\n\r]/gm, "");

    this.outputStream.write(outputWithoutEmptyLines);
    endOutputStream(this.outputStream);
  }
}

const contentTemplate = template(`1..<%= totalCount %>
<% results.forEach((result, index) => { %>
<%= result.isOverBudget ? 'not ' : '' %>ok <%= index + 1 %> - <%= result.message %>
<% }) %>
`);
