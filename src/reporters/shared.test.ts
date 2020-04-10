jest.mock(
  "terminal-link",
  () => (
    _text: string,
    _url: string,
    { fallback }: { fallback: () => string }
  ): string => fallback()
);

import { Instance as ChalkInstance } from "chalk";

import { OutputContext, Result, Results } from "../types";

import {
  formatBaselineDifference,
  formatBaselineDifferenceArrow,
  formatBaselineSize,
  formatMaxSize,
  formatPath,
  formatSize,
  formatSizeVsBaselineSize,
  formatSizeVsMaxSize,
  formatTotalBaselinesDifference,
  formatTotalBaselinesDifferenceArrow,
  formatTotalBaselinesSize,
  formatTotalResultsSize,
  linkPath,
} from "./shared";

let mockOutputContext: OutputContext;

beforeEach(() => {
  mockOutputContext = {
    colors: new ChalkInstance({ level: 1 }),
    maxPathLength: Infinity,
    verbose: true,
  };
});

describe(".formatSize", () => {
  describe("without a result", () => {
    it("returns an empty string", () => {
      expect(formatSize({})).toMatchInlineSnapshot(`""`);
    });
  });

  describe("with a result", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(formatSize({ result: mockResult })).toMatchInlineSnapshot(`"2B"`);
    });
  });
});

describe(".formatMaxSize", () => {
  describe("without a result", () => {
    it("returns an empty string", () => {
      expect(formatMaxSize({})).toMatchInlineSnapshot(`""`);
    });
  });

  describe("with a result", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(formatMaxSize({ result: mockResult })).toMatchInlineSnapshot(
        `"3B"`
      );
    });
  });
});

describe(".formatBaselineSize", () => {
  describe("without a baseline", () => {
    it("returns an empty string", () => {
      expect(formatBaselineSize({})).toMatchInlineSnapshot(`""`);
    });
  });

  describe("with a baseline", () => {
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatBaselineSize({ baseline: mockBaseline })
      ).toMatchInlineSnapshot(`"2B"`);
    });
  });
});

describe(".formatSizeVsMaxSize", () => {
  describe("when result is over budget", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 1 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsMaxSize({
          result: mockResult,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[1m[31m2B >= 1B[39m[22m"`);
    });
  });

  describe("when result is equal to budget", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 2 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsMaxSize({
          result: mockResult,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[1m[31m2B >= 2B[39m[22m"`);
    });
  });

  describe("when result is under budget", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsMaxSize({
          result: mockResult,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[2m2B < 3B[22m"`);
    });
  });

  describe("when overriding the color", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsMaxSize({
          result: mockResult,
          outputContext: {
            ...mockOutputContext,
            colorOverride: mockOutputContext.colors.green,
          },
        })
      ).toMatchInlineSnapshot(`"[32m2B < 3B[39m"`);
    });
  });
});

describe(".formatSizeVsBaselineSize", () => {
  describe("when result is under baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 1, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsBaselineSize({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[2m1B < 2B[22m"`);
    });
  });

  describe("when result is equal to baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsBaselineSize({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[2m2B < 2B[22m"`);
    });
  });

  describe("when result is over baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 3, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsBaselineSize({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[1m[31m3B >= 2B[39m[22m"`);
    });
  });

  describe("when overriding the color", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 3, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsBaselineSize({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: {
            ...mockOutputContext,
            colorOverride: mockOutputContext.colors.green,
          },
        })
      ).toMatchInlineSnapshot(`"[32m3B >= 2B[39m"`);
    });
  });

  describe("without baseline", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 3, maxSize: 3 };

    it("returns the formatted size", () => {
      expect(
        formatSizeVsBaselineSize({
          result: mockResult,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[1m[31m3B >= 0B[39m[22m"`);
    });
  });
});

describe(".formatBaselineDifference", () => {
  describe("when there is no difference", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns an empty string", () => {
      expect(
        formatBaselineDifference({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`""`);
    });
  });

  describe("when there is difference", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 3, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted difference", () => {
      expect(
        formatBaselineDifference({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"1B"`);
    });
  });
});

describe(".formatTotalResultsSize", () => {
  const mockResults: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
    "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
  };

  it("returns the formatted total size", () => {
    expect(
      formatTotalResultsSize({
        results: mockResults,
        outputContext: mockOutputContext,
      })
    ).toMatchInlineSnapshot(`"6B"`);
  });
});

describe(".formatTotalBaselinesSize", () => {
  const mockResults: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
    "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
  };
  const mockBaselines: Results = {
    "foo/bar.js": { path: "foo/bar.js", size: 1, maxSize: 3 },
    "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
  };

  it("returns the formatted total size", () => {
    expect(
      formatTotalBaselinesSize({
        results: mockResults,
        baselines: mockBaselines,
        outputContext: mockOutputContext,
      })
    ).toMatchInlineSnapshot(`"5B"`);
  });
});

describe(".formatTotalBaselinesDifference", () => {
  describe("when there is no difference", () => {
    const mockResults: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };
    const mockBaselines: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };

    it("returns an empty string", () => {
      expect(
        formatTotalBaselinesDifference({
          results: mockResults,
          baselines: mockBaselines,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`""`);
    });
  });

  describe("when there is difference", () => {
    const mockResults: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };
    const mockBaselines: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 1, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };

    it("returns the formatted total difference", () => {
      expect(
        formatTotalBaselinesDifference({
          results: mockResults,
          baselines: mockBaselines,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"1B"`);
    });
  });
});

describe(".formatBaselineDifferenceArrow", () => {
  describe("with a positive difference", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 1, maxSize: 3 };

    it("returns an up arrow", () => {
      expect(
        formatBaselineDifferenceArrow({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[31m▲[39m"`);
    });
  });

  describe("with a negative difference", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 1, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns a down arrow", () => {
      expect(
        formatBaselineDifferenceArrow({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[32m▼[39m"`);
    });
  });

  describe("with no difference", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };
    const mockBaseline: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns an empty string", () => {
      expect(
        formatBaselineDifferenceArrow({
          result: mockResult,
          baseline: mockBaseline,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`" "`);
    });
  });
});

describe(".formatTotalBaselinesDifferenceArrow", () => {
  describe("with a positive difference", () => {
    const mockResults: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };
    const mockBaselines: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 1, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };

    it("returns an up arrow", () => {
      expect(
        formatTotalBaselinesDifferenceArrow({
          results: mockResults,
          baselines: mockBaselines,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[31m▲[39m"`);
    });
  });

  describe("with a negative difference", () => {
    const mockResults: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 1, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };
    const mockBaselines: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };

    it("returns a down arrow", () => {
      expect(
        formatTotalBaselinesDifferenceArrow({
          results: mockResults,
          baselines: mockBaselines,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`"[32m▼[39m"`);
    });
  });

  describe("with no difference", () => {
    const mockResults: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };
    const mockBaselines: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 2, maxSize: 3 },
      "foo/baz.js": { path: "foo/baz.js", size: 4, maxSize: 5 },
    };

    it("returns an empty string", () => {
      expect(
        formatTotalBaselinesDifferenceArrow({
          results: mockResults,
          baselines: mockBaselines,
          outputContext: mockOutputContext,
        })
      ).toMatchInlineSnapshot(`" "`);
    });
  });
});

describe(".formatPath", () => {
  describe("when not in current directory", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted path", () => {
      expect(
        formatPath({ result: mockResult, outputContext: mockOutputContext })
      ).toMatchInlineSnapshot(`"[2mfoo/[22m[1mbar.js[22m"`);
    });
  });

  describe("when in current directory", () => {
    const mockResult: Result = { path: "./bar.js", size: 2, maxSize: 3 };

    it("returns the formatted path", () => {
      expect(
        formatPath({ result: mockResult, outputContext: mockOutputContext })
      ).toMatchInlineSnapshot(`"[1mbar.js[22m"`);
    });
  });

  describe("with a path below max length", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns the formatted path", () => {
      expect(
        formatPath({
          result: mockResult,
          outputContext: {
            ...mockOutputContext,
            maxPathLength: 10,
          },
        })
      ).toMatchInlineSnapshot(`"[2mfoo/[22m[1mbar.js[22m"`);
    });
  });

  describe("with a path above max length", () => {
    const mockResult: Result = { path: "foo/barbaz.js", size: 2, maxSize: 3 };

    it("returns the formatted path", () => {
      expect(
        formatPath({
          result: mockResult,
          outputContext: {
            ...mockOutputContext,
            maxPathLength: 10,
          },
        })
      ).toMatchInlineSnapshot(`"[2mfoo/[22m[1mbarba…[22m"`);
    });
  });
});

describe(".linkPath", () => {
  describe("when not in current directory", () => {
    const mockResult: Result = { path: "foo/bar.js", size: 2, maxSize: 3 };

    it("returns a link to the path", () => {
      expect(
        linkPath({ result: mockResult, outputContext: mockOutputContext })
      ).toContain("bar.js");
    });
  });

  describe("when in current directory", () => {
    const mockResult: Result = { path: "./bar.js", size: 2, maxSize: 3 };

    it("returns a link to the path", () => {
      expect(
        linkPath({ result: mockResult, outputContext: mockOutputContext })
      ).toContain("bar.js");
    });
  });
});
