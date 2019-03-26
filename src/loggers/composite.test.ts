import CompositeLogger from "./composite";
import { Logger, Result } from "./logger";

describe("composite logger", () => {
  let testLogger: Logger;
  let compositeLogger: Logger;

  beforeEach(() => {
    testLogger = { log: jest.fn(), finalize: jest.fn() };
    compositeLogger = new CompositeLogger(testLogger);
  });

  describe(".log", () => {
    let result: Result;

    beforeEach(() => {
      result = { path: "foo", size: 80, maxSize: 100 };
      compositeLogger.log(result);
    });

    it("calls log() on each logger", () => {
      expect(testLogger.log).toHaveBeenCalledWith(result);
    });
  });

  describe(".finalize", () => {
    let promise: Promise<void>;

    describe("when one of the loggers finalize() rejects", () => {
      let error: Error;

      beforeEach(() => {
        error = new Error("boom");
        (testLogger.finalize as jest.Mock).mockReturnValue(Promise.reject(error));

        promise = compositeLogger.finalize();
      });

      it("returns a rejecting promise with the failure", async () => {
        await expect(promise).rejects.toEqual(error);
      });
    });

    describe("when all loggers finalize() resolves", () => {
      beforeEach(() => {
        (testLogger.finalize as jest.Mock).mockReturnValue(Promise.resolve());

        promise = compositeLogger.finalize();
      });

      it("returns a resolving promise", async () => {
        await expect(promise).resolves.toBeUndefined();
      });
    });
  });
});
