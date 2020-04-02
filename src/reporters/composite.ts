import { Reporter, Result } from "../types";

export interface CompositeReporterOptions {
  reporters: Reporter[];
}

export default class CompositeReporter implements Reporter {
  private readonly reporters: CompositeReporterOptions["reporters"];

  public constructor({ reporters }: CompositeReporterOptions) {
    this.reporters = reporters;
  }

  public async onRunStart(): Promise<void> {
    await Promise.all(this.reporters.map((reporter) => reporter.onRunStart()));
  }

  public async onResult(result: Result): Promise<void> {
    await Promise.all(
      this.reporters.map((reporter) => reporter.onResult(result))
    );
  }

  public async onRunComplete(results: Result[]): Promise<void> {
    await Promise.all(
      this.reporters.map((reporter) => reporter.onRunComplete(results))
    );
  }
}
