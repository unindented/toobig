import { cosmiconfigSync } from "cosmiconfig";
import { existsSync, lstatSync } from "fs-extra";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json") as { name: string };

export const parserConfiguration = {
  "boolean-negation": true,
  "camel-case-expansion": false,
  "combine-arrays": false,
  "dot-notation": false,
  "duplicate-arguments-array": true,
  "flatten-duplicate-arrays": false,
  "halt-at-non-option": false,
  "negation-prefix": "no-",
  "parse-numbers": false,
  "populate--": false,
  "set-placeholder-key": false,
  "short-option-groups": false,
  "strip-aliased": false,
  "strip-dashed": false,
  "unknown-options-as-args": false,
};

export const configParser = (configPath?: string): object => {
  const explorer = cosmiconfigSync(pkg.name);
  const result = isFile(configPath)
    ? explorer.load(configPath)
    : explorer.search(configPath);

  return result != null && typeof result.config === "object"
    ? (result.config as object)
    : {};
};

const isFile = (path?: string): path is string =>
  !!(path && existsSync(path) && lstatSync(path).isFile());
