import { ReporterConfig, Results } from "../types";

import {
  projectsConfigSchema,
  reportersConfigSchema,
  resultsConfigSchema,
} from "./shared";

describe("reportersConfigSchema", () => {
  it("accepts a valid config", () => {
    const reporters: ReporterConfig = [
      "line",
      ["table", { template: "markdown" }],
    ];
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

describe("projectsConfigSchema", () => {
  it("accepts a valid config", () => {
    const projects = ["foo", "bar"];
    const { error } = projectsConfigSchema.validate(projects);

    expect(error).toBeUndefined();
  });
});
