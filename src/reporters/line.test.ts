// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("../shared", () => ({
  ...jest.requireActual("../shared"),
  getOutputStream: jest.fn().mockName("getOutputStream"),
}));

import { Writable } from "stream";

import { getOutputStream } from "../shared";
import { Reporter, Result } from "../types";

import { LineReporter } from ".";

const noResults: Result[] = [];
const resultsMultipleOver = require("../__fixtures__/results-multiple-over.json") as Result[];
const resultsOneOver = require("../__fixtures__/results-one-over.json") as Result[];
const resultsUnder = require("../__fixtures__/results-under.json") as Result[];

describe("LineReporter", () => {
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
    ["without color", { color: false }],
    ["with output stream", { output: "foobar" }],
  ])("%s", (_desc, options) => {
    beforeEach(() => {
      reporter = new LineReporter(options);
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