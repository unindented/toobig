jest.mock("./loggers/console.ts");
jest.mock("./loggers/json.ts");

import * as path from "path";

import tooBig from ".";
import { /* CompositeLogger,*/ ConsoleLogger, JsonLogger } from "./loggers";

describe("toobig", () => {
  beforeEach(() => {
    expect.assertions(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("not passing a config file", () => {
    it("finds a config file", async () => {
      await expect(tooBig()).resolves.toBeUndefined();
    });

    it("logs the results", async () => {
      await tooBig();
      expect(ConsoleLogger.prototype.log).toHaveBeenCalled();
    });
  });

  describe("suppressing standard output", () => {
    beforeEach(async () => {
      await tooBig({ quiet: true });
    });

    it("does not log results", async () => {
      expect(ConsoleLogger.prototype.log).not.toHaveBeenCalled();
    });
  });

  describe("passing a good config file", () => {
    beforeEach(async () => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.good.json");
      await tooBig({ config });
    });

    it("logs the results", async () => {
      expect(ConsoleLogger.prototype.log).toHaveBeenCalled();
    });
  });

  describe("when specifying JSON but no filename", () => {
    let promise: Promise<void>;

    beforeEach(() => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.good.json");
      promise = tooBig({ config, json: "" });
    });

    it("throws", async () => {
      await expect(promise).rejects.toEqual(new Error("when specifying the json option you must specify a file"));
    });
  });

  describe("with a config having budgets that will be exceeded and not requesting JSON", () => {
    let promise: Promise<void>;

    beforeEach(() => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.fail.json");
      promise = tooBig({ config });
    });

    it("returns a rejecting promise with the error", async () => {
      await expect(promise).rejects.toEqual(new Error("some files are over their max size"));
    });

    it("logs results", async () => {
      try {
        await promise;
      } catch {
        expect(ConsoleLogger.prototype.log).toHaveBeenCalled();
      }
    });
  });

  describe("with a config having budgets that will be exceeded and requesting JSON", () => {
    const jsonFile = "toobig.log.json";

    let promise: Promise<void>;

    beforeEach(() => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.partial-fail.json");
      promise = tooBig({ config, json: jsonFile });
    });

    it("returns a rejecting promise with the error", async () => {
      await expect(promise).rejects.toEqual(new Error("some files are over their max size"));
    });

    it("prepares the results as JSON", async () => {
      try {
        await promise;
      } catch {
        expect(JsonLogger.prototype.log).toHaveBeenCalled();
      }
    });

    it("writes the JSON to a file", async () => {
      try {
        await promise;
      } catch {
        expect(JsonLogger.prototype.finalize).toHaveBeenCalled();
      }
    });

    it("continues to write the results to the console", async () => {
      try {
        await promise;
      } catch {
        expect(ConsoleLogger.prototype.log).toHaveBeenCalled();
      }
    });
  });

  describe("passing a config file with too-strict settings", () => {
    let promise: Promise<void>;

    beforeEach(() => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.strict.json");
      promise = tooBig({ config });
    });

    it("throws", async () => {
      await expect(promise).rejects.toMatchSnapshot();
    });
  });

  describe("passing an invalid config file", () => {
    let promise: Promise<void>;

    beforeEach(() => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.invalid.json");
      promise = tooBig({ config });
    });

    it("throws", async () => {
      try {
        await promise;
      } catch (err) {
        expect(err.message).toMatch(
          /JSON Error in .+\/src\/__fixtures__\/toobig.invalid.json/,
        );
      }
    });
  });

  describe("passing an empty config file", () => {
    let promise: Promise<void>;

    beforeEach(() => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.empty.json");
      promise = tooBig({ config });
    });

    it("throws", async () => {
      try {
        await promise;
      } catch (err) {
        expect(err.message).toMatch(
          /config file found at .+\/src\/__fixtures__\/toobig.empty.json\" is missing key \"restrictions"/,
        );
      }
    });
  });

  describe("passing a non-existent config file", () => {
    let promise: Promise<void>;

    beforeEach(() => {
      const config = path.resolve(__dirname, "__fixtures__/toobig.notfound.json");
      promise = tooBig({ config });
    });

    it("throws", async () => {
      try {
        await promise;
      } catch (err) {
        expect(err.message).toMatch(
          /no such file or directory, open .+\/src\/__fixtures__\/toobig.notfound.json'/,
        );
      }
    });
  });
});
