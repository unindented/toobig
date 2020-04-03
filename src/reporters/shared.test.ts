jest.mock(
  "terminal-link",
  () => (
    _text: string,
    _url: string,
    { fallback }: { fallback: () => string }
  ): string => fallback()
);

import { Instance as ChalkInstance } from "chalk";

import { OutputContext, Result } from "../types";

import {
  formatMaxSize,
  formatPath,
  formatSize,
  formatSizeVsMaxSize,
  formatTotalSize,
  linkPath,
} from "./shared";

let outputContext: OutputContext;

beforeEach(() => {
  outputContext = { colors: new ChalkInstance({ level: 1 }) };
});

describe(".formatSize", () => {
  const result: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

  it("returns the formatted size", () => {
    expect(formatSize(result)).toMatchInlineSnapshot(`"2B"`);
  });
});

describe(".formatMaxSize", () => {
  const result: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

  it("returns the formatted size", () => {
    expect(formatMaxSize(result)).toMatchInlineSnapshot(`"3B"`);
  });
});

describe(".formatSizeVsMaxSize", () => {
  describe("when result is over budget", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };

    it("returns the formatted size", () => {
      expect(formatSizeVsMaxSize(result, outputContext)).toMatchInlineSnapshot(
        `"[1m[31m2B >= 1B[39m[22m"`
      );
    });
  });

  describe("when result is equal to budget", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 2 };

    it("returns the formatted size", () => {
      expect(formatSizeVsMaxSize(result, outputContext)).toMatchInlineSnapshot(
        `"[1m[31m2B >= 2B[39m[22m"`
      );
    });
  });

  describe("when result is under budget", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(formatSizeVsMaxSize(result, outputContext)).toMatchInlineSnapshot(
        `"[2m2B < 3B[22m"`
      );
    });
  });

  describe("when overriding the color", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsMaxSize(result, {
          ...outputContext,
          colorOverride: outputContext.colors.green,
        })
      ).toMatchInlineSnapshot(`"[32m2B < 3B[39m"`);
    });
  });
});

describe(".formatTotalSize", () => {
  const results: readonly Result[] = [
    { path: "foo/bar.js", size: 2, maxSize: 3 },
    { path: "foo/baz.js", size: 4, maxSize: 5 },
  ];

  it("returns the formatted total size", () => {
    expect(formatTotalSize(results)).toMatchInlineSnapshot(`"6B"`);
  });
});

describe(".formatPath", () => {
  describe("when not in current directory", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted path", () => {
      expect(formatPath(result, outputContext)).toMatchInlineSnapshot(
        `"[2mfoo/[22m[1mbar.js[22m"`
      );
    });
  });

  describe("when in current directory", () => {
    const result: Result = { path: "./bar.js", size: 2, maxSize: 3 };

    it("returns the formatted path", () => {
      expect(formatPath(result, outputContext)).toMatchInlineSnapshot(
        `"[1mbar.js[22m"`
      );
    });
  });
});

describe(".linkPath", () => {
  describe("when not in current directory", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns a link to the path", () => {
      expect(linkPath(result, outputContext)).toContain("bar.js");
    });
  });

  describe("when in current directory", () => {
    const result: Result = { path: "./bar.js", size: 2, maxSize: 3 };

    it("returns a link to the path", () => {
      expect(linkPath(result, outputContext)).toContain("bar.js");
    });
  });
});
