import { Reporter, Result, Results } from "../types";

export interface CompositeReporterOptions {
  readonly reporters: readonly Reporter[];
}

export default class CompositeReporter implements Reporter {
  private readonly reporters: CompositeReporterOptions["reporters"];

  public constructor({ reporters }: CompositeReporterOptions) {
    this.reporters = reporters;
  }

  public async onRunStart(): Promise<void> {
    await Promise.all(this.reporters.map((reporter) => reporter.onRunStart()));
  }

  public async onResult(result: Result, baseline: Result): Promise<void> {
    await Promise.all(
      this.reporters.map((reporter) => reporter.onResult(result, baseline))
    );
  }

  public async onRunComplete(
    results: Results,
    baselines?: Results
  ): Promise<void> {
    await Promise.all(
      this.reporters.map((reporter) =>
        reporter.onRunComplete(results, baselines)
      )
    );
  }
}
