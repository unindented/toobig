import { Reporter, Results } from "./../types";
import CompositeReporter from "./composite";

const results: Results = {
  foo: { path: "foo.js", size: 1, maxSize: 2 },
};

describe("CompositeReporter", () => {
  let mockReporter: Reporter;
  let compositeReporter: Reporter;

  beforeEach(() => {
    mockReporter = {
      onRunStart: jest.fn().mockName("onRunStart"),
      onResult: jest.fn().mockName("onResult"),
      onRunComplete: jest.fn().mockName("onRunComplete"),
    };
    compositeReporter = new CompositeReporter({ reporters: [mockReporter] });
  });

  describe("#onRunStart", () => {
    beforeEach(async () => {
      await compositeReporter.onRunStart();
    });

    it("calls `onRunStart` on each reporter", () => {
      expect(mockReporter.onRunStart).toHaveBeenCalled();
    });
  });

  describe("#onResult", () => {
    beforeEach(async () => {
      await compositeReporter.onResult(results[0]);
    });

    it("calls `onResult` on each reporter", () => {
      expect(mockReporter.onResult).toHaveBeenCalledWith(results[0]);
    });
  });

  describe("#onRunComplete", () => {
    beforeEach(async () => {
      await compositeReporter.onRunComplete(results);
    });

    it("calls `onRunComplete` on each reporter", () => {
      expect(mockReporter.onRunComplete).toHaveBeenCalledWith(results);
    });
  });
});
