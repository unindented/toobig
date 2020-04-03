jest.mock("./line");
jest.mock("./summary");
jest.mock("./table");

import { reportResults } from "../commands/shared";
import { Reporter, Results } from "../types";

import LineReporter from "./line";
import SummaryReporter from "./summary";
import TableReporter from "./table";

import { DefaultReporter } from ".";

const results: Results = {
  foo: { path: "foo.js", size: 1, maxSize: 2 },
};

describe("DefaultReporter", () => {
  let reporter: Reporter;

  beforeEach(async () => {
    reporter = new DefaultReporter();

    await reportResults({ results, reporter });
  });

  describe.each([
    ["line", LineReporter],
    ["table", TableReporter],
    ["summary", SummaryReporter],
  ])("for %s reporter", (_desc, Klass) => {
    it("calls `onRunStart`", () => {
      expect(Klass.prototype.onRunStart).toHaveBeenCalledTimes(1);
    });

    it("calls `onResult`", () => {
      expect(Klass.prototype.onResult).toHaveBeenCalledTimes(1);
    });

    it("calls `onRunComplete`", () => {
      expect(Klass.prototype.onRunComplete).toHaveBeenCalledTimes(1);
    });
  });
});
