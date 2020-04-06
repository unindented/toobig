import { endOutputStream, getOutputStream } from "../shared";
import { OutputStream, Reporter, Results } from "../types";

export interface JSONReporterOptions {
  readonly output?: string | NodeJS.WritableStream;
}

export default class JSONReporter implements Reporter {
  private readonly outputStream: OutputStream;

  public constructor({ output = "stdout" }: JSONReporterOptions = {}) {
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {}

  public onResult(): void {}

  public onRunComplete(results: Results): void {
    this.outputStream.write(JSON.stringify(results, null, 2) + "\n");
    endOutputStream(this.outputStream);
  }
}
