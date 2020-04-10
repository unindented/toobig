jest.mock("../shared", () => ({
  ...jest.requireActual("../shared"),
  getOutputStream: jest.fn().mockName("getOutputStream"),
}));

import { Writable } from "stream";

import { reportResults } from "../commands/shared";
import { getOutputStream } from "../shared";
import { Reporter, Results } from "../types";

import { TableReporter } from ".";

const noResults: Results = {};
const resultsBaselines = require("../__fixtures__/results-baselines.json") as Results;
const resultsMultipleOver = require("../__fixtures__/results-multiple-over.json") as Results;
const resultsOneOver = require("../__fixtures__/results-one-over.json") as Results;
const resultsUnder = require("../__fixtures__/results-under.json") as Results;

describe("TableReporter", () => {
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
    ["without verbosity", { verbose: false }],
    ["with template `markdown`", { template: "markdown" as const }],
    ["with template `ramac`", { template: "ramac" as const }],
  ])("%s", (_desc1, options) => {
    beforeEach(() => {
      reporter = new TableReporter(options);
    });

    describe.each([
      ["with all results under budget", resultsUnder, undefined],
      ["with one result over budget", resultsOneOver, undefined],
      ["with multiple results over budget", resultsMultipleOver, undefined],
      ["with no results", noResults, undefined],
      ["with baselines", resultsUnder, resultsBaselines],
    ])("%s", (_desc2, results, baselines) => {
      beforeEach(async () => {
        await reportResults({ results, baselines, reporter });
      });

      it("writes to output stream with results", () => {
        expect(output.join("")).toMatchSnapshot();
      });
    });
  });
});
