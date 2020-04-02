import { basename, dirname, relative, resolve, sep } from "path";

import bytes from "bytes";
import terminalLink from "terminal-link";

import { getTotalSize, isOverBudget, supportsColor } from "../shared";
import { OutputContext, Result } from "../types";

export { getTotalSize, isOverBudget, supportsColor };

export const formatSize = ({ size }: Result): string => bytes(size);

export const formatMaxSize = ({ maxSize }: Result): string => bytes(maxSize);

export const formatSizeVsMaxSize = (
  result: Result,
  { colors, colorOverride }: OutputContext
): string => {
  const overMaxSize = isOverBudget(result);
  const color = colorOverride
    ? colorOverride
    : overMaxSize
    ? colors.bold.red
    : colors.dim;
  const operator = overMaxSize ? ">=" : "<";

  return color(`${formatSize(result)} ${operator} ${formatMaxSize(result)}`);
};

export const formatTotalSize = (results: Result[]): string =>
  bytes(getTotalSize(results));

export const formatPath = (
  { path }: Result,
  { colors }: OutputContext
): string => {
  const relativePath = relative(process.cwd(), path);
  const dir = dirname(relativePath);
  const base = basename(relativePath);
  return `${dir !== "." ? colors.dim(dir + sep) : ""}${colors.bold(base)}`;
};

export const linkPath = (result: Result, options: OutputContext): string => {
  const formattedPath = formatPath(result, options);
  return terminalLink(
    formattedPath,
    `file://${resolve(process.cwd(), result.path)}`,
    {
      fallback: () => formattedPath,
    }
  );
};
