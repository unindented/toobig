jest.mock("../shared", () => ({
  ...jest.requireActual("../shared"),
  getOutputStream: jest.fn().mockName("getOutputStream"),
}));

import { Writable } from "stream";

import { reportResults } from "../commands/shared";
import { getOutputStream } from "../shared";
import { Reporter, Results } from "../types";

import { JSONReporter } from ".";

const noResults: Results = {};
const resultsMultipleOver = require("../__fixtures__/results-multiple-over.json") as Results;
const resultsOneOver = require("../__fixtures__/results-one-over.json") as Results;
const resultsUnder = require("../__fixtures__/results-under.json") as Results;

describe("JSONReporter", () => {
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
  ])("%s", (_desc1, options) => {
    beforeEach(() => {
      reporter = new JSONReporter(options);
    });

    describe.each([
      ["with all results under budget", resultsUnder],
      ["with one result over budget", resultsOneOver],
      ["with multiple results over budget", resultsMultipleOver],
      ["with no results", noResults],
    ])("%s", (_desc2, results) => {
      beforeEach(async () => {
        await reportResults({ results, reporter });
      });

      it("writes to output stream with results", () => {
        expect(output.join("")).toMatchSnapshot();
      });
    });
  });
});
