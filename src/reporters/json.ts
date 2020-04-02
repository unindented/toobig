import { endOutputStream, getOutputStream } from "../shared";
import { OutputStream, Reporter, Result } from "../types";

export interface JSONReporterOptions {
  output?: string | NodeJS.WritableStream;
}

export default class JSONReporter implements Reporter {
  private readonly outputStream: OutputStream;

  public constructor({ output = "stdout" }: JSONReporterOptions = {}) {
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {
    return;
  }

  public onResult(): void {
    return;
  }

  public onRunComplete(results: Result[]): void {
    this.outputStream.write(JSON.stringify(results, null, 2) + "\n");
    endOutputStream(this.outputStream);
  }
}
