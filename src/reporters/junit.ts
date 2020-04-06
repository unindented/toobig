import template from "lodash/template";

import {
  endOutputStream,
  getOutputContext,
  getOutputStream,
  isOverBudget,
} from "../shared";
import { OutputContext, OutputStream, Reporter, Results } from "../types";

import { formatSizeVsMaxSize } from "./shared";

export interface JUnitReporterOptions {
  readonly output?: string | NodeJS.WritableStream;
}

export default class JUnitReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({ output = "stdout" }: JUnitReporterOptions = {}) {
    this.outputContext = getOutputContext({ supportsColor: false });
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {}

  public onResult(): void {}

  public onRunComplete(results: Results): void {
    const values = Object.values(results);
    const valuesOverBudget = values.filter(isOverBudget);

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

const contentTemplate = template(`<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="toobig test suites" tests="<%- totalCount %>" failures="<%- failedCount %>">
  <testsuite name="toobig test suite" tests="<%- totalCount %>" failures="<%- failedCount %>">
    <% results.forEach(result => { %>
    <testcase name="<%- result.path %>" classname="<%- result.path %>">
      <% if (result.isOverBudget) { %>
      <failure message="<%- result.message %>">Entry over budget: <%- result.message %></failure>
      <% } %>
    </testcase>
    <% }); %>
  </testsuite>
</testsuites>
`);
