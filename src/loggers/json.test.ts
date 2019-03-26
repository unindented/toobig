import { readFileSync, unlinkSync } from "fs";

import JsonLogger from "./json";
import { Logger } from "./logger";

describe("json logger", () => {
  let filename: string;
  let logger: Logger;

  beforeEach(() => {
    filename = "test-file";
    logger = new JsonLogger(filename);
  });

  afterEach(() => {
    unlinkSync(filename);
  });

  describe(".log", () => {
    describe("with a failure result", () => {
      beforeEach(() => {
        logger.log({ path: "foo", size: 80, maxSize: 100 });
        logger.log({ path: "bar", size: 100, maxSize: 80 });
      });

      describe("when finalized", () => {
        beforeEach(async () => {
          await logger.finalize();
        });

        it("writes the correct results to the file", () => {
          const contents = readFileSync(filename, "utf8");
          const results = JSON.parse(contents);
          expect(results).toMatchSnapshot();
        });
      });
    });

    describe("with only success results", () => {
      beforeEach(() => {
        logger.log({ path: "foo", size: 80, maxSize: 100 });
      });

      describe("when finalized", () => {
        beforeEach(async () => {
          await logger.finalize();
        });

        it("writes the correct results to the file", () => {
          const contents = readFileSync(filename, "utf8");
          const results = JSON.parse(contents);
          expect(results).toMatchSnapshot();
        });
      });
    });
  });
});
