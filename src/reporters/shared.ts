import { basename, dirname, relative, resolve as resolvePath, sep } from "path";

import bytes from "bytes";
import terminalLink from "terminal-link";

import {
  getBaselineDifference,
  getTotalBaselinesDifference,
  getTotalBaselinesSize,
  getTotalResultsSize,
  isOverBudget,
} from "../shared";
import {
  ResultContext,
  ResultWithBaselineContext,
  ResultsContext,
  ResultsWithBaselinesContext,
} from "../types";

export const formatSize = ({
  result,
}: Partial<Pick<ResultContext, "result">>): string =>
  result ? bytes(result.size) : "";

export const formatMaxSize = ({
  result,
}: Partial<Pick<ResultContext, "result">>): string =>
  result ? bytes(result.maxSize) : "";

export const formatBaselineSize = ({
  baseline,
}: Partial<Pick<ResultWithBaselineContext, "baseline">>): string =>
  baseline ? bytes(baseline.size) : "";

export const formatSizeVsMaxSize = (context: ResultContext): string => {
  const {
    result,
    outputContext: { colors, colorOverride },
  } = context;
  const overBudget = isOverBudget(result);
  const color = colorOverride
    ? colorOverride
    : overBudget
    ? colors.bold.red
    : colors.dim;
  const operator = overBudget ? ">=" : "<";

  return color(`${formatSize(context)} ${operator} ${formatMaxSize(context)}`);
};

export const formatSizeVsBaselineSize = (context: ResultContext): string => {
  const {
    outputContext: { colors, colorOverride },
  } = context;
  const overBaseline = getBaselineDifference(context) > 0;
  const color = colorOverride
    ? colorOverride
    : overBaseline
    ? colors.bold.red
    : colors.dim;
  const operator = overBaseline ? ">=" : "<";

  return color(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    `${formatSize(context)} ${operator} ${
      formatBaselineSize(context) || bytes(0)
    }`
  );
};

export const formatBaselineDifference = (context: ResultContext): string => {
  const difference = getBaselineDifference(context);
  return difference !== 0 ? bytes(difference) : "";
};

export const formatTotalResultsSize = (context: ResultsContext): string =>
  bytes(getTotalResultsSize(context));

export const formatTotalBaselinesSize = (
  context: ResultsWithBaselinesContext
): string => bytes(getTotalBaselinesSize(context));

export const formatTotalBaselinesDifference = (
  context: ResultsWithBaselinesContext
): string => {
  const difference = getTotalBaselinesDifference(context);
  return difference !== 0 ? bytes(difference) : "";
};

const failMark = "\u2717";
const passMark = "\u2713";

export const formatMaxSizeMark = ({
  result,
  outputContext: { colors },
}: ResultContext): string =>
  isOverBudget(result) ? colors.red(failMark) : colors.green(passMark);

const upArrow = "\u25B2";
const downArrow = "\u25BC";

export const formatBaselineDifferenceArrow = (
  context: ResultWithBaselineContext
): string => {
  const {
    outputContext: { colors },
  } = context;
  const difference = getBaselineDifference(context);
  return difference > 0
    ? colors.red(upArrow)
    : difference < 0
    ? colors.green(downArrow)
    : " ";
};

export const formatTotalBaselinesDifferenceArrow = (
  context: ResultsWithBaselinesContext
): string => {
  const {
    outputContext: { colors },
  } = context;
  const difference = getTotalBaselinesDifference(context);
  return difference > 0
    ? colors.red(upArrow)
    : difference < 0
    ? colors.green(downArrow)
    : " ";
};

const ellipsis = "\u2026";

const truncateString = (str: string, maxLength: number): string =>
  str.length <= maxLength ? str : `${str.substr(0, maxLength - 1)}${ellipsis}`;

export const formatPath = ({
  result: { path },
  outputContext: { colors, maxLength },
}: ResultContext): string => {
  const relativePath = relative(process.cwd(), path);
  const dir = dirname(relativePath);
  const dirWithSep = dir !== "." ? dir + sep : "";
  const base = truncateString(
    basename(relativePath),
    maxLength - dirWithSep.length
  );
  return `${colors.dim(dirWithSep)}${colors.bold(base)}`;
};

export const linkPath = (resultContext: ResultContext): string => {
  const formattedPath = formatPath(resultContext);
  return terminalLink(
    formattedPath,
    `file://${resolvePath(process.cwd(), resultContext.result.path)}`,
    {
      fallback: () => formattedPath,
    }
  );
};
