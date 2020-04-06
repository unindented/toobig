jest.mock("../commands/scan");

import { resolve as resolvePath } from "path";

import yargs, { Arguments } from "yargs";

import { scanAndReport } from "../commands/scan";
import { ScanConfig } from "../types";

import * as scanCommand from "./scan";
import { parserConfiguration } from "./shared";

const pkg = require("../../package.json") as { name: string };

describe("scan", () => {
  let parse: (arg: string) => Promise<string>;

  beforeEach(() => {
    (scanAndReport as jest.Mock).mockResolvedValue({
      results: [],
      anyOverBudget: false,
    });

    const parser = yargs
      .scriptName(pkg.name)
      .command<any>(scanCommand)
      .help()
      .parserConfiguration(parserConfiguration);

    parse = (arg: string): Promise<string> =>
      new Promise((resolve, reject) => {
        parser.parse(
          arg,
          (
            err: Error | undefined,
            _argv: Arguments<ScanConfig>,
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
      output = await parse("scan --help");
    });

    it("shows help output", () => {
      expect(output).toMatchSnapshot();
    });
  });

  describe("with one set of budgets", () => {
    beforeEach(async () => {
      await parse('scan --budgets "dist/*.js" 4KB --cwd dist');
    });

    it("calls `scanAndReport` with the right configuration", () => {
      expect(scanAndReport).toHaveBeenCalledWith(
        expect.objectContaining({
          budgets: {
            "dist/*.js": "4KB",
          },
          cwd: "dist",
        })
      );
    });
  });

  describe("with two sets of budgets", () => {
    beforeEach(async () => {
      await parse('scan --budgets "dist/*.js" 4KB --budgets "dist/*.css" 2KB');
    });

    it("calls `scanAndReport` with the right configuration", () => {
      expect(scanAndReport).toHaveBeenCalledWith(
        expect.objectContaining({
          budgets: {
            "dist/*.js": "4KB",
            "dist/*.css": "2KB",
          },
        })
      );
    });
  });

  describe("with reporters", () => {
    beforeEach(async () => {
      await parse('scan --budgets "dist/*.js" 4KB --reporters table summary');
    });

    it("calls `scanAndReport` with the right configuration", () => {
      expect(scanAndReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reporters: ["table", "summary"],
        })
      );
    });
  });

  describe("with a config file", () => {
    const configPath = resolvePath(
      __dirname,
      "../__fixtures__/scan-config-valid.json"
    );
    const config = require(configPath);

    beforeEach(async () => {
      await parse(`scan --config ${configPath}`);
    });

    it("calls `scanAndReport` with the right configuration", () => {
      expect(scanAndReport).toHaveBeenCalledWith(
        expect.objectContaining(config)
      );
    });
  });
});
