import { loadConfigSchema } from "./load";

describe("loadConfigSchema", () => {
  it("accepts a valid config", () => {
    const config = require("../__fixtures__/load-config-valid.json") as object;
    const { error } = loadConfigSchema.validate(config);

    expect(error).toBeUndefined();
  });

  it("rejects a config without results", () => {
    const config = require("../__fixtures__/load-config-no-results.json") as object;
    const { error } = loadConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "results" is required]`
    );
  });

  it("rejects a config with invalid results", () => {
    const config = require("../__fixtures__/load-config-invalid-results.json") as object;
    const { error } = loadConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "results" must be one of [string, object]]`
    );
  });

  it("rejects a config with invalid reporters", () => {
    const config = require("../__fixtures__/load-config-invalid-reporters.json") as object;
    const { error } = loadConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "reporters[0]" must be one of [string, array]]`
    );
  });
});
