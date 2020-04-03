import { resolve } from "path";

import { CompositeReporter } from "../reporters";
import { Reporter, Results } from "../types";

import { getCompositeReporter, reportResults } from "./shared";

describe(".getCompositeReporter", () => {
  it("returns a composite reporter", () => {
    expect(
      getCompositeReporter([
        "line",
        ["table", { template: "markdown" }],
        resolve(__dirname, "../reporters/summary"),
      ])
    ).toBeInstanceOf(CompositeReporter);
  });
});

describe(".reportResults", () => {
  const results: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 4064, maxSize: 4096 },
    "foo/baz.js": { path: "foo/baz.js", size: 4064, maxSize: 4096 },
  };

  let mockReporter: Reporter;

  beforeEach(async () => {
    mockReporter = {
      onRunStart: jest.fn().mockName("onRunStart"),
      onResult: jest.fn().mockName("onResult"),
      onRunComplete: jest.fn().mockName("onRunComplete"),
    };
    await reportResults({ results, reporter: mockReporter });
  });

  it("calls `reporter.onRunStart` once", () => {
    expect(mockReporter.onRunStart).toHaveBeenCalledTimes(1);
  });

  it("calls `reporter.onResult` once per result", () => {
    expect(mockReporter.onResult).toHaveBeenCalledTimes(2);
  });

  it("calls `reporter.onRunComplete` once", () => {
    expect(mockReporter.onRunComplete).toHaveBeenCalledWith(results);
  });
});
