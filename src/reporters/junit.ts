import template from "lodash/template";

import { endOutputStream, getOutputContext, getOutputStream } from "../shared";
import { OutputContext, OutputStream, Reporter, Result } from "../types";

import { formatSizeVsMaxSize, isOverBudget } from "./shared";

export interface JUnitReporterOptions {
  readonly output?: string | NodeJS.WritableStream;
}

export default class JUnitReporter implements Reporter {
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({ output = "stdout" }: JUnitReporterOptions = {}) {
    this.outputContext = getOutputContext(false);
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {
    return;
  }

  public onResult(): void {
    return;
  }

  public onRunComplete(results: readonly Result[]): void {
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
