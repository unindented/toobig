import { loadConfigSchema } from "./load";

describe("loadConfigSchema", () => {
  it("accepts a valid config", () => {
    const config = require("../__fixtures__/load-config-valid.json") as object;
    const { error } = loadConfigSchema.validate(config);

    expect(error).toBeUndefined();
  });

  it("rejects a config without input", () => {
    const config = require("../__fixtures__/load-config-no-input.json") as object;
    const { error } = loadConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "input" is required]`
    );
  });

  it("rejects a config with invalid budgets", () => {
    const config = require("../__fixtures__/load-config-invalid-input.json") as object;
    const { error } = loadConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "input" must be one of [string, array]]`
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
