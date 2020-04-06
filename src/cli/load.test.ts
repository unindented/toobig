jest.mock("../commands/load");

import { resolve as resolvePath } from "path";

import yargs, { Arguments } from "yargs";

import { loadAndReport } from "../commands/load";
import { LoadConfig } from "../types";

import * as loadCommand from "./load";
import { parserConfiguration } from "./shared";

const pkg = require("../../package.json") as { name: string };

describe("load", () => {
  let parse: (arg: string) => Promise<string>;

  beforeEach(() => {
    (loadAndReport as jest.Mock).mockResolvedValue({
      results: [],
      anyOverBudget: false,
    });

    const parser = yargs
      .scriptName(pkg.name)
      .command<any>(loadCommand)
      .help()
      .parserConfiguration(parserConfiguration);

    parse = (arg: string): Promise<string> =>
      new Promise((resolve, reject) => {
        parser.parse(
          arg,
          (
            err: Error | undefined,
            _argv: Arguments<LoadConfig>,
            output: string
          ) => {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          }
        );
      });
  });

  describe("with `--help`", () => {
    let output: string;

    beforeEach(async () => {
      output = await parse("load --help");
    });

    it("shows help output", () => {
      expect(output).toMatchSnapshot();
    });
  });

  describe("with results", () => {
    beforeEach(async () => {
      await parse("load --results results.json");
    });

    it("calls `loadAndReport` with the right configuration", () => {
      expect(loadAndReport).toHaveBeenCalledWith(
        expect.objectContaining({
          results: "results.json",
        })
      );
    });
  });

  describe("with reporters", () => {
    beforeEach(async () => {
      await parse("load --results results.json --reporters table summary");
    });

    it("calls `loadAndReport` with the right configuration", () => {
      expect(loadAndReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reporters: ["table", "summary"],
        })
      );
    });
  });

  describe("with a config file", () => {
    const configPath = resolvePath(
      __dirname,
      "../__fixtures__/load-config-valid.json"
    );
    const config = require(configPath);

    beforeEach(async () => {
      await parse(`load --config ${configPath}`);
    });

    it("calls `loadAndReport` with the right configuration", () => {
      expect(loadAndReport).toHaveBeenCalledWith(
        expect.objectContaining(config)
      );
    });
  });
});
