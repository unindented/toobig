jest.mock("axios");
jest.mock("fs-extra");

import { Readable, Writable } from "stream";

import axios from "axios";
import { createReadStream, createWriteStream, ensureFileSync } from "fs-extra";

import {
  endOutputStream,
  getInputStream,
  getOutputContext,
  getOutputStream,
  getTotalSize,
  isOverBudget,
} from "./shared";
import { InputStream, OutputStream, Result } from "./types";

describe(".isOverBudget", () => {
  describe("when result is over budget", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };

    it("returns true", () => {
      expect(isOverBudget(result)).toBe(true);
    });
  });

  describe("when result is equal to budget", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 2 };

    it("returns true", () => {
      expect(isOverBudget(result)).toBe(true);
    });
  });

  describe("when result is under budget", () => {
    const result: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns false", () => {
      expect(isOverBudget(result)).toBe(false);
    });
  });
});

describe(".getTotalSize", () => {
  describe("when there are no results", () => {
    const results: Result[] = [];

    it("returns 0", () => {
      expect(getTotalSize(results)).toBe(0);
    });
  });

  describe("when there are results", () => {
    const results: Result[] = [
      { path: "foo.js", size: 1, maxSize: 2 },
      { path: "bar.js", size: 2, maxSize: 2 },
    ];

    it("returns the total size", () => {
      expect(getTotalSize(results)).toBe(3);
    });
  });
});

describe(".getOutputContext", () => {
  describe("when supports color", () => {
    it("instantiates `chalk` with level 1", () => {
      expect(getOutputContext(true).colors.level).toBeGreaterThan(0);
    });
  });

  describe("when does not support color", () => {
    it("instantiates `chalk` with level 0", () => {
      expect(getOutputContext(false).colors.level).toBe(0);
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
});
