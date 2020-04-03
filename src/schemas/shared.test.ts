import { Results } from "../types";

import { reportersConfigSchema, resultsConfigSchema } from "./shared";

describe("reportersConfigSchema", () => {
  it("accepts a valid config", () => {
    const reporters = ["line", ["table", { template: "markdown" }]];
    const { error } = reportersConfigSchema.validate(reporters);

    expect(error).toBeUndefined();
  });
});

describe("resultsConfigSchema", () => {
  it("accepts a valid config", () => {
    const results: Results = {
      "foo/bar.js": { path: "foo/bar.js", size: 4064, maxSize: 4096 },
      "foo/baz.js": { path: "foo/baz.js", size: 4064, maxSize: 4096 },
    };
    const { error } = resultsConfigSchema.validate(results);

    expect(error).toBeUndefined();
  });
});
