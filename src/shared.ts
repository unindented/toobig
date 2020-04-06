import { parse } from "url";

import axios from "axios";
import {
  Instance as ChalkInstance,
  supportsColor as globalSupportsColor,
} from "chalk";
import { createReadStream, createWriteStream, ensureFileSync } from "fs-extra";

import {
  InputStream,
  OutputContext,
  OutputStream,
  Result,
  ResultContext,
  Results,
  ResultsContext,
  ResultsWithBaselinesContext,
  WritableResults,
} from "./types";

export { globalSupportsColor as supportsColor };

export const isOverBudget = ({ size, maxSize }: Result): boolean =>
  size >= maxSize;

export const getBaselineDifference = ({
  result,
  baseline,
}: Pick<ResultContext, "result" | "baseline">): number =>
  result.size - (baseline ? baseline.size : 0);

export const isUnderBaseline = (baselines?: Results) => (
  result: Result
): boolean => {
  if (baselines === undefined) {
    return false;
  }

  const baseline = baselines[result.path];
  return getBaselineDifference({ result, baseline }) < 0;
};

export const isOverBaseline = (baselines?: Results) => (
  result: Result
): boolean => {
  if (baselines === undefined) {
    return false;
  }

  const baseline = baselines[result.path];
  return getBaselineDifference({ result, baseline }) > 0;
};

export const filterResults = (
  results: Results,
  predicate: (result: Result) => boolean
): Results =>
  Object.keys(results).reduce((acc, key) => {
    if (predicate(results[key])) {
      acc[key] = results[key];
    }
    return acc;
  }, {} as WritableResults);

export const getTotalResultsSize = ({
  results,
}: Pick<ResultsContext, "results">): number => getTotalSize(results);

export const getTotalBaselinesSize = ({
  baselines,
}: Pick<ResultsWithBaselinesContext, "baselines">): number =>
  getTotalSize(baselines);

const getTotalSize = (results: Results): number =>
  Object.values(results).reduce((acc, { size }) => acc + size, 0);

export const getTotalBaselinesDifference = ({
  results,
  baselines,
}: Pick<ResultsWithBaselinesContext, "results" | "baselines">): number =>
  Object.values(results).reduce((acc, { path, size }) => {
    const baseline = baselines[path];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return acc + size - (baseline ? baseline.size : 0);
  }, 0);

export const getOutputContext = ({
  supportsColor,
  maxLength = Infinity,
}: {
  supportsColor: boolean;
  maxLength?: number;
}): OutputContext => ({
  colors: new ChalkInstance(!supportsColor ? { level: 0 } : undefined),
  maxLength,
});

export const getOutputStream = (
  output: string | NodeJS.WritableStream
): OutputStream => {
  if (output === "stdout" || output === "stderr") {
    return process[output];
  }

  if (typeof output === "string") {
    ensureFileSync(output);
    return createWriteStream(output);
  }

  return output;
};

export const endOutputStream = (stream: OutputStream): void => {
  if (stream === process.stdout || stream === process.stderr) {
    return;
  }

  stream.end();
};

export const getInputStream = async (
  input: string | NodeJS.ReadableStream
): Promise<InputStream> => {
  if (input === "stdin") {
    return process.stdin;
  }

  if (typeof input === "string") {
    const { protocol } = parse(input);
    return protocol === null
      ? createReadStream(input)
      : createAxiosStream(input);
  }

  return input;
};

const createAxiosStream = async (
  input: string
): Promise<NodeJS.ReadableStream> => {
  const { data: stream } = await axios.get<NodeJS.ReadableStream>(input, {
    responseType: "stream",
    timeout: 10000,
  });
  return stream;
};

export const readInputStream = (stream: InputStream): Promise<string> => {
  return new Promise((resolve, reject) => {
    const contents: string[] = [];

    stream.on("data", (data: string | Buffer) => {
      contents.push(data.toString());
    });

    stream.on("end", () => {
      resolve(contents.join(""));
    });

    stream.on("error", (error: Error) => {
      reject(error);
    });
  });
};
