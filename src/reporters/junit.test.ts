// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("../shared", () => ({
  ...jest.requireActual("../shared"),
  getOutputStream: jest.fn().mockName("getOutputStream"),
}));

import { Writable } from "stream";

import { getOutputStream } from "../shared";
import { Reporter, Result } from "../types";

import { JUnitReporter } from ".";

const noResults: readonly Result[] = [];
const resultsMultipleOver = require("../__fixtures__/results-multiple-over.json") as readonly Result[];
const resultsOneOver = require("../__fixtures__/results-one-over.json") as readonly Result[];
const resultsUnder = require("../__fixtures__/results-under.json") as readonly Result[];

describe("JUnitReporter", () => {
  let reporter: Reporter;
  let output: string[];

  beforeEach(() => {
    output = [];
    const stream = new Writable({
      write(chunk: Buffer | string, _encoding, callback): void {
        output.push(chunk.toString());
        callback();
      },
    });
    (getOutputStream as jest.Mock).mockReturnValue(stream);
  });

  describe.each([
    ["with default options", undefined],
    ["with output stream", { output: "foobar" }],
  ])("%s", (_desc, options) => {
    beforeEach(() => {
      reporter = new JUnitReporter(options);
    });

    describe.each([
      ["with all results under budget", resultsUnder],
      ["with one result over budget", resultsOneOver],
      ["with multiple results over budget", resultsMultipleOver],
      ["with no results", noResults],
    ])("%s", (_desc, results) => {
      beforeEach(async () => {
        await reporter.onRunStart();
        for (const result of results) {
          await reporter.onResult(result);
        }
        await reporter.onRunComplete(results);
      });

      it("writes to output stream with results", () => {
        expect(output.join("")).toMatchSnapshot();
      });
    });
  });
});
