jest.mock("supports-color", () => ({
  supportsColor: (): boolean => true,
  stdout: { level: 3, hasBasic: true, has256: true, has16m: true },
  stderr: { level: 3, hasBasic: true, has256: true, has16m: true },
}));
