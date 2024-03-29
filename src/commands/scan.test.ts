jest.mock(
  "fast-glob",
  () => (): Promise<readonly string[]> =>
    Promise.resolve(["foo/bar.js", "foo/baz.js"])
);
jest.mock("get-folder-size");
jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"),
  getCompositeReporter: jest.fn().mockName("getCompositeReporter"),
}));

import getFolderSize from "get-folder-size";

import { BudgetsConfig, Reporter, Results, ReturnValues } from "../types";

import { scanAndReport } from "./scan";
import { getCompositeReporter } from "./shared";

describe(".scanAndReport", () => {
  const mockBudgets: BudgetsConfig = {
    "foo/*.js": "4KB",
    "**/*.js": "8KB",
  };
  const mockBaselines: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 4032, maxSize: 4096 },
    "foo/baz.js": { path: "foo/baz.js", size: 4064, maxSize: 4096 },
  };

  let promise: Promise<ReturnValues>;
  let mockReporter: Reporter;

  beforeEach(() => {
    mockReporter = {
      onRunStart: jest.fn().mockName("onRunStart"),
      onResult: jest.fn().mockName("onResult"),
      onRunComplete: jest.fn().mockName("onRunComplete"),
    };
    (getCompositeReporter as jest.Mock).mockReturnValue(mockReporter);
  });

  describe("with budgets", () => {
    beforeEach(() => {
      (getFolderSize as jest.Mock).mockImplementation(
        (_path: string, cb: (error: Error | null, size: number) => void) =>
          cb(null, 4064)
      );
      promise = scanAndReport({ budgets: mockBudgets });
    });

    it("resolves with results", async () => {
      await expect(promise).resolves.toMatchInlineSnapshot(`
              Object {
                "anyOverBaseline": false,
                "anyOverBudget": false,
                "anyUnderBaseline": false,
                "results": Object {
                  "foo/bar.js": Object {
                    "maxSize": 4096,
                    "path": "foo/bar.js",
                    "size": 4064,
                  },
                  "foo/baz.js": Object {
                    "maxSize": 4096,
                    "path": "foo/baz.js",
                    "size": 4064,
                  },
                },
              }
            `);
    });

    it("calls `reporter.onRunStart` once", async () => {
      await promise;
      expect(mockReporter.onRunStart).toHaveBeenCalledTimes(1);
    });

    it("calls `reporter.onResult` once per result", async () => {
      await promise;
      expect(mockReporter.onResult).toHaveBeenCalledTimes(2);
    });

    it("calls `reporter.onRunComplete` once", async () => {
      const { results } = await promise;
      expect(mockReporter.onRunComplete).toHaveBeenCalledWith(
        results,
        undefined
      );
    });
  });

  describe("with budgets and baselines", () => {
    beforeEach(() => {
      (getFolderSize as jest.Mock).mockImplementation(
        (_path: string, cb: (error: Error | null, size: number) => void) =>
          cb(null, 4064)
      );
      promise = scanAndReport({
        budgets: mockBudgets,
        baselines: mockBaselines,
      });
    });

    it("resolves with results", async () => {
      await expect(promise).resolves.toMatchInlineSnapshot(`
              Object {
                "anyOverBaseline": true,
                "anyOverBudget": false,
                "anyUnderBaseline": false,
                "results": Object {
                  "foo/bar.js": Object {
                    "maxSize": 4096,
                    "path": "foo/bar.js",
                    "size": 4064,
                  },
                  "foo/baz.js": Object {
                    "maxSize": 4096,
                    "path": "foo/baz.js",
                    "size": 4064,
                  },
                },
              }
            `);
    });

    it("calls `reporter.onRunStart` once", async () => {
      await promise;
      expect(mockReporter.onRunStart).toHaveBeenCalledTimes(1);
    });

    it("calls `reporter.onResult` once per result", async () => {
      await promise;
      expect(mockReporter.onResult).toHaveBeenCalledTimes(2);
    });

    it("calls `reporter.onRunComplete` once", async () => {
      const { results } = await promise;
      expect(mockReporter.onRunComplete).toHaveBeenCalledWith(
        results,
        mockBaselines
      );
    });
  });

  describe("when `getFolderSize` fails", () => {
    beforeEach(() => {
      (getFolderSize as jest.Mock).mockImplementation(
        (_path: string, cb: (error: Error | null, size?: number) => void) =>
          cb(new Error("BOOM"))
      );

      promise = scanAndReport({ budgets: mockBudgets });
    });

    it("rejects", async () => {
      await expect(promise).rejects.toMatchInlineSnapshot(`[Error: BOOM]`);
    });
  });
});
