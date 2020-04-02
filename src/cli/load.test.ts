jest.mock("../commands/load");

import { resolve } from "path";

import yargs, { Arguments } from "yargs";

import { loadAndReport } from "../commands/load";
import { LoadConfig } from "../types";

import * as loadCommand from "./load";
import { parserConfiguration } from "./shared";

// eslint-disable-next-line @typescript-eslint/no-var-requires
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

  describe("with input", () => {
    beforeEach(async () => {
      await parse("load --input results.json");
    });

    it("calls `loadAndReport` with the right configuration", () => {
      expect(loadAndReport).toHaveBeenCalledWith(
        expect.objectContaining({
          input: "results.json",
        })
      );
    });
  });

  describe("with reporters", () => {
    beforeEach(async () => {
      await parse("load --input results.json --reporters table summary");
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
    const configPath = resolve(
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
