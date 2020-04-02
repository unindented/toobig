import { scanConfigSchema } from "./scan";

describe("scanConfigSchema", () => {
  it("accepts a valid config", () => {
    const config = require("../__fixtures__/scan-config-valid.json") as object;
    const { error } = scanConfigSchema.validate(config);

    expect(error).toBeUndefined();
  });

  it("rejects a config without budgets", () => {
    const config = require("../__fixtures__/scan-config-no-budgets.json") as object;
    const { error } = scanConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "budgets" is required]`
    );
  });

  it("rejects a config with invalid budgets", () => {
    const config = require("../__fixtures__/scan-config-invalid-budgets.json") as object;
    const { error } = scanConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "budgets" must be of type object]`
    );
  });

  it("rejects a config with more invalid budgets", () => {
    const config = require("../__fixtures__/scan-config-more-invalid-budgets.json") as object;
    const { error } = scanConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "budgets.foo.js" must be a string]`
    );
  });

  it("rejects a config with invalid reporters", () => {
    const config = require("../__fixtures__/scan-config-invalid-reporters.json") as object;
    const { error } = scanConfigSchema.validate(config);

    expect(error).toMatchInlineSnapshot(
      `[ValidationError: "reporters[0]" must be one of [string, array]]`
    );
  });
});
