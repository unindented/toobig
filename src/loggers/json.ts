import { writeFile } from "fs";

import { Logger, Result } from "./logger";

interface JsonResults {
  readonly successes: Result[];
  readonly failures: Result[];
}

const isOverMaxSize = ({ size, maxSize }: Result): boolean => size >= maxSize;

export default class JsonLogger implements Logger {
  private filename: string;
  private results: JsonResults;

  constructor(filename: string) {
    this.filename = filename;
    this.results = {
      successes: [],
      failures: [],
    };
  }

  public log(result: Result): void {
    if (isOverMaxSize(result)) {
      this.results.failures.push(result);
    } else {
      this.results.successes.push(result);
    }
  }

  public finalize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const resultsString = JSON.stringify(this.results);
      writeFile(this.filename, resultsString, "utf8", err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
