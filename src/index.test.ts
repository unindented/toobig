(global as any).console = {
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

import * as path from "path";

import tooBig from ".";

describe("toobig", () => {
  let config: string;

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

    it("logs results", async () => {
      await tooBig();
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe("suppressing standard output", () => {
    it("does not log results", async () => {
      await tooBig({ quiet: true });
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("passing a good config file", () => {
    beforeAll(() => {
      config = path.resolve(__dirname, "__fixtures__/toobig.good.json");
    });

    it("logs results", async () => {
      await tooBig({ config });
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe("with a config file having budgets that will be exceeded", () => {
    beforeAll(() => {
      config = path.resolve(__dirname, "__fixtures__/toobig.fail.json");
    });

    it("returns a rejecting promise with the error", async () => {
      await expect(tooBig({ config })).rejects.toEqual(
        new Error("some files are over their max size"),
      );
    });

    it("logs results", async () => {
      try {
        await tooBig({ config });
      } catch {
        expect(console.log).toHaveBeenCalled();
      }
    });
  });

  describe("passing a config file with too-strict settings", () => {
    beforeAll(() => {
      config = path.resolve(__dirname, "__fixtures__/toobig.strict.json");
    });

    it("throws", async () => {
      await expect(tooBig({ config })).rejects.toMatchSnapshot();
    });
  });

  describe("passing an invalid config file", () => {
    beforeAll(() => {
      config = path.resolve(__dirname, "__fixtures__/toobig.invalid.json");
    });

    it("throws", async () => {
      try {
        await tooBig({ config });
      } catch (err) {
        expect(err.message).toMatch(
          /JSON Error in .+\/src\/__fixtures__\/toobig.invalid.json/,
        );
      }
    });
  });

  describe("passing an empty config file", () => {
    beforeAll(() => {
      config = path.resolve(__dirname, "__fixtures__/toobig.empty.json");
    });

    it("throws", async () => {
      try {
        await tooBig({ config });
      } catch (err) {
        expect(err.message).toMatch(
          /config file found at .+\/src\/__fixtures__\/toobig.empty.json\" is missing key \"restrictions"/,
        );
      }
    });
  });

  describe("passing a non-existent config file", () => {
    beforeAll(() => {
      config = path.resolve(__dirname, "__fixtures__/toobig.notfound.json");
    });

    it("throws", async () => {
      try {
        await tooBig({ config });
      } catch (err) {
        expect(err.message).toMatch(
          /no such file or directory, open .+\/src\/__fixtures__\/toobig.notfound.json'/,
        );
      }
    });
  });
});
