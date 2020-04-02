// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("../shared", () => ({
  ...jest.requireActual("../shared"),
  getInputStream: jest.fn().mockName("getInputStream"),
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("./shared", () => ({
  ...jest.requireActual("./shared"),
  getCompositeReporter: jest.fn().mockName("getCompositeReporter"),
}));

import { Readable } from "stream";

import noop from "lodash/noop";

import { getInputStream } from "../shared";
import { Reporter, ReturnValue } from "../types";

import { loadAndReport } from "./load";
import { getCompositeReporter } from "./shared";

describe(".loadAndReport", () => {
  const input = "results.json";
  const results = [
    { path: "foo/bar.js", size: 4064, maxSize: 4096 },
    { path: "foo/baz.js", size: 4064, maxSize: 4096 },
  ];

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

  describe("with results", () => {
    beforeEach(() => {
      promise = loadAndReport({ input: results });
    });

    it("resolves with results", async () => {
      await expect(promise).resolves.toMatchInlineSnapshot(`
        Object {
          "anyOverBudget": false,
          "results": Array [
            Object {
              "maxSize": 4096,
              "path": "foo/bar.js",
              "size": 4064,
            },
            Object {
              "maxSize": 4096,
              "path": "foo/baz.js",
              "size": 4064,
            },
          ],
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
      expect(mockReporter.onRunComplete).toHaveBeenCalledWith(results);
    });
  });

  describe("with a path", () => {
    describe("when `getInputStream` returns a stream that ends succesfully", () => {
      beforeEach(() => {
        const stream = new Readable({ read: noop });
        stream.push(
          JSON.stringify([
            { maxSize: 4096, path: "foo/bar.js", size: 4064 },
            { maxSize: 4096, path: "foo/baz.js", size: 4064 },
          ])
        );
        stream.push(null);
        (getInputStream as jest.Mock).mockResolvedValue(stream);

        promise = loadAndReport({ input });
      });

      it("resolves with results", async () => {
        await expect(promise).resolves.toMatchInlineSnapshot(`
        Object {
          "anyOverBudget": false,
          "results": Array [
            Object {
              "maxSize": 4096,
              "path": "foo/bar.js",
              "size": 4064,
            },
            Object {
              "maxSize": 4096,
              "path": "foo/baz.js",
              "size": 4064,
            },
          ],
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
        expect(mockReporter.onRunComplete).toHaveBeenCalledWith(results);
      });
    });

    describe("when `getInputStream` returns a stream that errors", () => {
      beforeEach(() => {
        const stream = new Readable({ read: noop });
        setTimeout(() => {
          stream.emit("error", new Error("BOOM"));
        }, 100);
        (getInputStream as jest.Mock).mockResolvedValue(stream);

        promise = loadAndReport({ input });
      });

      it("rejects", async () => {
        await expect(promise).rejects.toMatchInlineSnapshot(`[Error: BOOM]`);
      });
    });

    describe("when `getInputStream` fails", () => {
      beforeEach(() => {
        (getInputStream as jest.Mock).mockRejectedValue(new Error("BOOM"));

        promise = loadAndReport({ input });
      });

      it("rejects", async () => {
        await expect(promise).rejects.toMatchInlineSnapshot(`[Error: BOOM]`);
      });
    });
  });
});
