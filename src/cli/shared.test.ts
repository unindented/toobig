import { tmpdir } from "os";
import { resolve } from "path";

import { configParser } from "./shared";

describe(".configParser", () => {
  describe("without path", () => {
    it("returns the config", () => {
      expect(configParser()).toEqual(
        expect.objectContaining({
          budgets: expect.anything(),
          reporters: expect.anything(),
        })
      );
    });
  });

  describe("with a path to a directory containing a config file", () => {
    const configPath = resolve(__dirname, "../..");

    it("returns the config", () => {
      expect(configParser(configPath)).toEqual(
        expect.objectContaining({
          budgets: expect.anything(),
          reporters: expect.anything(),
        })
      );
    });
  });

  describe("with a path to a config file", () => {
    const configPath = resolve(__dirname, "../../.toobigrc");

    it("returns the config", () => {
      expect(configParser(configPath)).toEqual(
        expect.objectContaining({
          budgets: expect.anything(),
          reporters: expect.anything(),
        })
      );
    });
  });

  describe("with a path to a directory not containing a config file", () => {
    const configPath = tmpdir();

    it("returns an empty object", () => {
      expect(configParser(configPath)).toEqual({});
    });
  });
});
