jest.mock("axios");
jest.mock("fs-extra");

import { Readable, Writable } from "stream";

import axios from "axios";
import { createReadStream, createWriteStream, ensureFileSync } from "fs-extra";
import noop from "lodash/noop";

import {
  endOutputStream,
  filterResults,
  getBaselineDifference,
  getInputStream,
  getOutputContext,
  getOutputStream,
  getTotalBaselinesDifference,
  getTotalBaselinesSize,
  getTotalResultsSize,
  isOverBaseline,
  isOverBudget,
  isUnderBaseline,
  readInputStream,
} from "./shared";
import { InputStream, OutputStream, Result, Results } from "./types";

describe(".getBaselineDifference", () => {
  describe("without a baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };

    it("returns the difference", () => {
      expect(getBaselineDifference({ result: mockResult })).toBe(2);
    });
  });

  describe("with a baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 1, maxSize: 1 };

    it("returns the difference", () => {
      expect(
        getBaselineDifference({
          result: mockResult,
          baseline: mockBaseline,
        })
      ).toBe(1);
    });
  });
});

describe(".isUnderBaseline", () => {
  const baselines = {
    "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 1 },
  };

  describe("when result is under baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 1, maxSize: 1 };

    it("returns true", () => {
      expect(isUnderBaseline(baselines)(mockResult)).toBe(true);
    });
  });

  describe("when result is equal to baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };

    it("returns false", () => {
      expect(isUnderBaseline(baselines)(mockResult)).toBe(false);
    });
  });

  describe("when result is over baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 3, maxSize: 1 };

    it("returns false", () => {
      expect(isUnderBaseline(baselines)(mockResult)).toBe(false);
    });
  });

  describe("without baselines", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 1, maxSize: 1 };

    it("returns false", () => {
      expect(isUnderBaseline()(mockResult)).toBe(false);
    });
  });
});

describe(".isOverBaseline", () => {
  const baselines = {
    "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 1 },
  };

  describe("when result is over baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 3, maxSize: 1 };

    it("returns true", () => {
      expect(isOverBaseline(baselines)(mockResult)).toBe(true);
    });
  });

  describe("when result is equal to baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };

    it("returns false", () => {
      expect(isOverBaseline(baselines)(mockResult)).toBe(false);
    });
  });

  describe("when result is under baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 1, maxSize: 1 };

    it("returns false", () => {
      expect(isOverBaseline(baselines)(mockResult)).toBe(false);
    });
  });

  describe("without baselines", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 3, maxSize: 1 };

    it("returns false", () => {
      expect(isOverBaseline()(mockResult)).toBe(false);
    });
  });
});

describe(".isOverBudget", () => {
  describe("when result is over budget", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };

    it("returns true", () => {
      expect(isOverBudget(mockResult)).toBe(true);
    });
  });

  describe("when result is equal to budget", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 2 };

    it("returns true", () => {
      expect(isOverBudget(mockResult)).toBe(true);
    });
  });

  describe("when result is under budget", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns false", () => {
      expect(isOverBudget(mockResult)).toBe(false);
    });
  });
});

describe(".filterResults", () => {
  const mockResults: Results = {
    "foo.js": { path: "foo.js", size: 1, maxSize: 2 },
    "bar.js": { path: "bar.js", size: 2, maxSize: 2 },
  };

  it("returns filtered results", () => {
    const filteredResults = filterResults(mockResults, ({ size }) => size < 2);
    expect(Object.keys(filteredResults)).toHaveLength(1);
  });
});

describe(".getTotalResultsSize", () => {
  describe("when there are no results", () => {
    const mockResults: Results = {};

    it("returns 0", () => {
      expect(getTotalResultsSize({ results: mockResults })).toBe(0);
    });
  });

  describe("when there are results", () => {
    const mockResults: Results = {
      "foo.js": { path: "foo.js", size: 1, maxSize: 2 },
      "bar.js": { path: "bar.js", size: 2, maxSize: 2 },
    };

    it("returns the total size", () => {
      expect(getTotalResultsSize({ results: mockResults })).toBe(3);
    });
  });
});

describe(".getTotalBaselinesSize", () => {
  describe("when there are no baselines", () => {
    const mockBaselines: Results = {};

    it("returns 0", () => {
      expect(getTotalBaselinesSize({ baselines: mockBaselines })).toBe(0);
    });
  });

  describe("when there are baselines", () => {
    const mockBaselines: Results = {
      "foo.js": { path: "foo.js", size: 1, maxSize: 2 },
      "bar.js": { path: "bar.js", size: 1, maxSize: 2 },
    };

    it("returns the total size", () => {
      expect(getTotalBaselinesSize({ baselines: mockBaselines })).toBe(2);
    });
  });
});

describe(".getTotalBaselinesDifference", () => {
  const mockResults: Results = {
    "foo.js": { path: "foo.js", size: 1, maxSize: 2 },
    "bar.js": { path: "bar.js", size: 2, maxSize: 2 },
    "baz.js": { path: "baz.js", size: 1, maxSize: 2 },
  };
  const mockBaselines: Results = {
    "foo.js": { path: "foo.js", size: 1, maxSize: 2 },
    "bar.js": { path: "bar.js", size: 1, maxSize: 2 },
    "qux.js": { path: "qux.js", size: 1, maxSize: 2 },
  };

  it("returns the total difference", () => {
    expect(
      getTotalBaselinesDifference({
        results: mockResults,
        baselines: mockBaselines,
      })
    ).toBe(2);
  });
});

describe(".getOutputContext", () => {
  describe("when supports color", () => {
    it("instantiates `chalk` with level greater than 0", () => {
      expect(
        getOutputContext({ supportsColor: true }).colors.level
      ).toBeGreaterThan(0);
    });
  });

  describe("when does not support color", () => {
    it("instantiates `chalk` with level 0", () => {
      expect(getOutputContext({ supportsColor: false }).colors.level).toBe(0);
    });
  });
});

describe(".getOutputStream", () => {
  let outputStream: OutputStream;

  describe("with `stdout`", () => {
    beforeEach(() => {
      outputStream = getOutputStream("stdout");
    });

    it("returns `process.stdout`", () => {
      expect(outputStream).toBe(process.stdout);
    });
  });

  describe("with `stderr`", () => {
    beforeEach(() => {
      outputStream = getOutputStream("stderr");
    });

    it("returns `process.stderr`", () => {
      expect(outputStream).toBe(process.stderr);
    });
  });

  describe("with a path", () => {
    beforeEach(() => {
      (createWriteStream as jest.Mock).mockReturnValue("STREAM");
      outputStream = getOutputStream("foo/bar.js");
    });

    it("ensures the path exists", () => {
      expect(ensureFileSync).toHaveBeenCalledWith("foo/bar.js");
    });

    it("returns a writable stream for that path", () => {
      expect(outputStream).toBe("STREAM");
    });
  });

  describe("with a writeable stream", () => {
    let originalStream: NodeJS.WritableStream;

    beforeEach(() => {
      originalStream = new Writable();
      outputStream = getOutputStream(originalStream);
    });

    it("returns the stream", () => {
      expect(outputStream).toBe(originalStream);
    });
  });
});

describe(".endOutputStream", () => {
  describe("with `process.stdout`", () => {
    it("does nothing", () => {
      expect(() => {
        endOutputStream(process.stdout);
      }).not.toThrow();
    });
  });

  describe("with `process.stderr`", () => {
    it("does nothing", () => {
      expect(() => {
        endOutputStream(process.stderr);
      }).not.toThrow();
    });
  });

  describe("with anything else", () => {
    let end: jest.Mock;

    beforeEach(() => {
      end = jest.fn().mockName("end");
      endOutputStream({ end } as any);
    });

    it("ends the stream", () => {
      expect(end).toHaveBeenCalled();
    });
  });
});

describe(".getInputStream", () => {
  let inputStream: InputStream;

  describe("with `stdin`", () => {
    beforeEach(async () => {
      inputStream = await getInputStream("stdin");
    });

    it("returns `process.stdin`", () => {
      expect(inputStream).toBe(process.stdin);
    });
  });

  describe("with a path", () => {
    beforeEach(async () => {
      (createReadStream as jest.Mock).mockReturnValue("STREAM");
      inputStream = await getInputStream("foo/bar.js");
    });

    it("returns a readable stream for that path", () => {
      expect(inputStream).toBe("STREAM");
    });
  });

  describe("with a URL", () => {
    beforeEach(async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: "STREAM" });
      inputStream = await getInputStream("https://www.google.com");
    });

    it("returns a readable stream for that URL", () => {
      expect(inputStream).toBe("STREAM");
    });
  });

  describe("with a readable stream", () => {
    let originalStream: NodeJS.ReadableStream;

    beforeEach(async () => {
      originalStream = new Readable();
      inputStream = await getInputStream(originalStream);
    });

    it("returns the stream", () => {
      expect(inputStream).toBe(originalStream);
    });
  });

  describe(".readInputStream", () => {
    let promise: Promise<string>;

    beforeEach(() => {
      const stream = new Readable({ read: noop });
      stream.push("CONTENTS");
      stream.push(null);

      promise = readInputStream(stream);
    });

    it("returns the contents of the stream", async () => {
      await expect(promise).resolves.toBe("CONTENTS");
    });
  });
});
