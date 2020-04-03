import { parse } from "url";

import axios from "axios";
import { Instance as ChalkInstance, supportsColor } from "chalk";
import { createReadStream, createWriteStream, ensureFileSync } from "fs-extra";

import { InputStream, OutputContext, OutputStream, Result } from "./types";

export { supportsColor };

export const isOverBudget = ({ size, maxSize }: Result): boolean =>
  size >= maxSize;

export const getTotalSize = (results: readonly Result[]): number =>
  results.reduce((acc, { size }) => acc + size, 0);

export const getOutputContext = (supportsColor: boolean): OutputContext => {
  return {
    colors: new ChalkInstance(!supportsColor ? { level: 0 } : undefined),
  };
};

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
    return protocol == null
      ? createReadStream(input)
      : await createAxiosStream(input);
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
