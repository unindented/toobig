jest.mock("../shared", () => ({
  ...jest.requireActual("../shared"),
  getInputStream: jest.fn().mockName("getInputStream"),
}));
jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"),
  getCompositeReporter: jest.fn().mockName("getCompositeReporter"),
}));

import { Readable } from "stream";

import noop from "lodash/noop";

import { getInputStream } from "../shared";
import { Reporter, Results, ReturnValue } from "../types";

import { loadAndReport } from "./load";
import { getCompositeReporter } from "./shared";

describe(".loadAndReport", () => {
  const mockPath = "results.json";
  const mockResults: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 4064, maxSize: 4096 },
    "foo/baz.js": { path: "foo/baz.js", size: 4064, maxSize: 4096 },
  };
  const mockBaselines: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 4032, maxSize: 4096 },
    "foo/baz.js": { path: "foo/baz.js", size: 4064, maxSize: 4096 },
  };

  let promise: Promise<ReturnValue>;
  let mockReporter: Reporter;

  beforeEach(() => {
    mockReporter = {
      onRunStart: jest.fn().mockName("onRunStart"),
      onResult: jest.fn().mockName("onResult"),
      onRunComplete: jest.fn().mockName("onRunComplete"),
    };
    (getCompositeReporter as jest.Mock).mockReturnValue(mockReporter);
  });

  describe("with loaded results", () => {
    beforeEach(() => {
      promise = loadAndReport({ results: mockResults });
    });

    it("resolves with results", async () => {
      await expect(promise).resolves.toMatchInlineSnapshot(`
              Object {
                "anyOverBudget": false,
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

  describe("with loaded results and baselines", () => {
    beforeEach(() => {
      promise = loadAndReport({
        results: mockResults,
        baselines: mockBaselines,
      });
    });

    it("resolves with results", async () => {
      await expect(promise).resolves.toMatchInlineSnapshot(`
              Object {
                "anyOverBudget": false,
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

  describe("with a results path", () => {
    describe("when `getInputStream` returns a stream that ends succesfully", () => {
      beforeEach(() => {
        const stream = new Readable({ read: noop });
        stream.push(JSON.stringify(mockResults));
        stream.push(null);
        (getInputStream as jest.Mock).mockResolvedValue(stream);

        promise = loadAndReport({ results: mockPath });
      });

      it("resolves with results", async () => {
        await expect(promise).resolves.toMatchInlineSnapshot(`
                Object {
                  "anyOverBudget": false,
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

    describe("when `getInputStream` returns a stream that errors", () => {
      beforeEach(() => {
        const stream = new Readable({ read: noop });
        setTimeout(() => {
          stream.emit("error", new Error("BOOM"));
        }, 100);
        (getInputStream as jest.Mock).mockResolvedValue(stream);

        promise = loadAndReport({ results: mockPath });
      });

      it("rejects", async () => {
        await expect(promise).rejects.toMatchInlineSnapshot(`[Error: BOOM]`);
      });
    });

    describe("when `getInputStream` fails", () => {
      beforeEach(() => {
        (getInputStream as jest.Mock).mockRejectedValue(new Error("BOOM"));

        promise = loadAndReport({ results: mockPath });
      });

      it("rejects", async () => {
        await expect(promise).rejects.toMatchInlineSnapshot(`[Error: BOOM]`);
      });
    });
  });
});
