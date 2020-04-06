import { resolve as resolvePath } from "path";

import { CompositeReporter } from "../reporters";
import { Reporter, Results } from "../types";

import { getCompositeReporter, reportResults } from "./shared";

describe(".getCompositeReporter", () => {
  it("returns a composite reporter", () => {
    expect(
      getCompositeReporter([
        "line",
        ["table", { template: "markdown" }],
        resolvePath(__dirname, "../reporters/summary"),
      ])
    ).toBeInstanceOf(CompositeReporter);
  });
});

describe(".reportResults", () => {
  const mockResults: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 4064, maxSize: 4096 },
    "foo/baz.js": { path: "foo/baz.js", size: 4064, maxSize: 4096 },
  };

  let mockReporter: Reporter;

  beforeEach(() => {
    mockReporter = {
      onRunStart: jest.fn().mockName("onRunStart"),
      onResult: jest.fn().mockName("onResult"),
      onRunComplete: jest.fn().mockName("onRunComplete"),
    };
  });

  describe("without baselines", () => {
    beforeEach(async () => {
      await reportResults({ results: mockResults, reporter: mockReporter });
    });

    it("calls `reporter.onRunStart` once", () => {
      expect(mockReporter.onRunStart).toHaveBeenCalledTimes(1);
    });

    it("calls `reporter.onResult` once per result", () => {
      expect(mockReporter.onResult).toHaveBeenCalledTimes(2);
    });

    it("calls `reporter.onRunComplete` once", () => {
      expect(mockReporter.onRunComplete).toHaveBeenCalledWith(
        mockResults,
        undefined
      );
    });
  });

  describe("with baselines", () => {
    const mockBaselines: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 4032, maxSize: 4096 },
      "foo/baz.js": { path: "foo/baz.js", size: 4064, maxSize: 4096 },
    };

    beforeEach(async () => {
      await reportResults({
        results: mockResults,
        baselines: mockBaselines,
        reporter: mockReporter,
      });
    });

    it("calls `reporter.onRunStart` once", () => {
      expect(mockReporter.onRunStart).toHaveBeenCalledTimes(1);
    });

    it("calls `reporter.onResult` once per result", () => {
      expect(mockReporter.onResult).toHaveBeenCalledTimes(2);
    });

    it("calls `reporter.onRunComplete` once", () => {
      expect(mockReporter.onRunComplete).toHaveBeenCalledWith(
        mockResults,
        mockBaselines
      );
    });
  });
});
