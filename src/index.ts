import bytes = require("bytes");
import chalk from "chalk";
import cosmiconfig = require("cosmiconfig");
import getFolderSize = require("get-folder-size");
import glob = require("glob");

// tslint:disable-next-line:no-var-requires
const pkg = require("../package.json");

export interface Options {
  config?: string;
  quiet?: boolean;
}

export interface Config {
  restrictions: Restrictions;
}

export interface Restrictions {
  [path: string]: string;
}

export interface ExpandedRestriction {
  path: string;
  size: number;
  maxSize: number;
}

export default async function tooBig(options: Options = {}): Promise<void> {
  const { config, quiet } = options;
  const { restrictions } = await getConfig(config);
  const expandedRestrictions = await expandRestrictions(restrictions);

  const anyOverMaxSize = expandedRestrictions.reduce<boolean>(
    (memo, restriction) => {
      if (!quiet) {
        logRestriction(restriction);
      }
      return memo || isOverMaxSize(restriction);
    },
    false,
  );

  if (anyOverMaxSize) {
    throw new Error("some files are over their max size");
  }
}

async function getConfig(path?: string): Promise<Config> {
  const explorer = cosmiconfig(pkg.name, { rcExtensions: true });
  const result = await explorer.load(null, path);

  if (result == null) {
    throw new Error(`no config file found starting from "${process.cwd()}"`);
  }

  if (result.config == null || result.config.restrictions == null) {
    throw new Error(
      `config file found at "${result.filepath}" is missing key "restrictions"`,
    );
  }

  return result.config as Config;
}

function expandRestrictions(
  restrictions: Restrictions,
): Promise<ExpandedRestriction[]> {
  const expandedRestrictions = Object.keys(restrictions).reduce<
    Promise<ExpandedRestriction[]>
  >(
    async (memo, path) => {
      const maxSize = bytes(restrictions[path]);
      const expandedRestriction = expandRestriction(path, maxSize);
      return [...(await memo), ...(await expandedRestriction)];
    },
    Promise.resolve([]) as Promise<ExpandedRestriction[]>,
  );
  return expandedRestrictions;
}

function expandRestriction(
  path: string,
  maxSize: number,
): Promise<ExpandedRestriction[]> {
  return new Promise<ExpandedRestriction[]>((resolve, reject) => {
    glob(path, (err: any, matches: string[]) => {
      if (err != null) {
        reject(err);
        return;
      }

      const expandedRestrictions = matches.map(async (match): Promise<
        ExpandedRestriction
      > => ({
        path: match,
        size: await getSize(match),
        maxSize,
      }));

      resolve(Promise.all(expandedRestrictions));
    });
  });
}

function logRestriction(restriction: ExpandedRestriction): void {
  const { path, size, maxSize } = restriction;
  const message = isOverMaxSize(restriction)
    ? chalk.red(`${path} ${bytes(size)} >= ${bytes(maxSize)}`)
    : chalk.green(`${path} ${bytes(size)} < ${bytes(maxSize)}`);
  // tslint:disable-next-line:no-console
  console.log(message);
}

function isOverMaxSize(restriction: ExpandedRestriction): boolean {
  const { size, maxSize } = restriction;
  return size >= maxSize;
}

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
