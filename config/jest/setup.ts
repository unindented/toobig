expect.assertions(1);

process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw err;
});

jest.mock("supports-color", () => ({
  supportsColor: (): boolean => true,
  stdout: { level: 3, hasBasic: true, has256: true, has16m: true },
  stderr: { level: 3, hasBasic: true, has256: true, has16m: true },
}));
