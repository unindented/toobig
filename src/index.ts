import bytes = require("bytes");
import cosmiconfig = require("cosmiconfig");
import getFolderSize = require("get-folder-size");
import glob = require("glob");

import {
  CompositeLogger,
  ConsoleLogger,
  JsonLogger,
  Logger,
  Result,
} from "./loggers";

// tslint:disable-next-line:no-var-requires
const pkg = require("../package.json");

export interface Options {
  config?: string;
  quiet?: boolean;
  json?: string;
}

export interface Config {
  restrictions: Restrictions;
}

export interface Restrictions {
  [path: string]: string;
}

export default async function tooBig(options: Options = {}): Promise<void> {
  const { config } = options;
  const { restrictions } = await getConfig(config);
  const results = await evaluateRestrictions(restrictions);

  const logger = createLogger(options);
  results.forEach(result => logger.log(result));
  await logger.finalize();

  const anyOverMaxSize = results.some(isOverMaxSize);
  if (anyOverMaxSize) {
    throw new Error("some files are over their max size");
  }
}

function createLogger(options: Options): Logger {
  const loggers: Logger[] = [];
  if (options.json === "") {
    throw new Error("when specifying the json option you must specify a file");
  }
  if (options.json) {
    loggers.push(new JsonLogger(options.json));
  }
  if (!options.quiet) {
    loggers.push(new ConsoleLogger());
  }
  return new CompositeLogger(...loggers);
}

async function getConfig(path?: string): Promise<Config> {
  const explorer = cosmiconfig(pkg.name, { rcExtensions: true });
  const result = await explorer.load(null, path);

  if (result == null) {
    throw new Error(`no config file found starting from "${process.cwd()}"`);
  }

  if (result.config == null || result.config.restrictions == null) {
    throw new Error(`config file found at "${result.filepath}" is missing key "restrictions"`);
  }

  return result.config as Config;
}

function evaluateRestrictions(restrictions: Restrictions): Promise<Result[]> {
  return Object.keys(restrictions).reduce<Promise<Result[]>>(
    async (memo, path) => {
      const maxSize = bytes(restrictions[path]);
      const expandedRestriction = expandRestriction(path, maxSize);
      return [...(await memo), ...(await expandedRestriction)];
    },
    Promise.resolve([]) as Promise<Result[]>,
  );
}

function expandRestriction(path: string, maxSize: number): Promise<Result[]> {
  return new Promise<Result[]>((resolve, reject) => {
    glob(path, (err: any, matches: string[]) => {
      if (err != null) {
        reject(err);
        return;
      }

      const expandedRestrictions = matches.map(
        async (match): Promise<Result> => ({
          path: match,
          size: await getSize(match),
          maxSize,
        }),
      );

      resolve(Promise.all(expandedRestrictions));
    });
  });
}

const isOverMaxSize = ({ size, maxSize }: Result): boolean => size >= maxSize;

function getSize(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    getFolderSize(path, (err: any, size: number) => {
      if (err != null) {
        reject(err);
        return;
      }
      resolve(size);
    });
  });
}
