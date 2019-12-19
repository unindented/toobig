import ConsoleLogger from './console';
import { Logger } from './logger';

(global as any).console = {
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('console logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new ConsoleLogger();
  });

  describe('.log', () => {
    describe('for a failure result', () => {
      beforeEach(() => {
        logger.log({ path: 'foo', size: 100, maxSize: 80 });
      });

      it('writes the correct message to console.log', () => {
        // tslint:disable-next-line:no-console
        const calls = (console.log as jest.Mock).mock.calls;
        expect(calls).toMatchSnapshot();
      });
    });

    describe('for a success result', () => {
      beforeEach(() => {
        logger.log({ path: 'foo', size: 80, maxSize: 100 });
      });

      it('writes the correct message to console.log', () => {
        // tslint:disable-next-line:no-console
        const calls = (console.log as jest.Mock).mock.calls;
        expect(calls).toMatchSnapshot();
      });
    });
  });

  describe('.finalize', () => {
    it('returns a resolving promise', async () => {
      await expect(logger.finalize()).resolves.toBeUndefined();
    });
  });
});
