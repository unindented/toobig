import bytes from 'bytes';
import chalk from 'chalk';

import { Logger, Result } from './logger';

const isOverMaxSize = ({ size, maxSize }: Result): boolean => size >= maxSize;

const createFailureMessage = ({ path, size, maxSize }: Result): string =>
  chalk.red(`${path} ${bytes(size)} >= ${bytes(maxSize)}`);

const createSuccessMessage = ({ path, size, maxSize }: Result): string =>
  chalk.green(`${path} ${bytes(size)} < ${bytes(maxSize)}`);

export default class ConsoleLogger implements Logger {
  public log(result: Result): void {
    const isFailure = isOverMaxSize(result);
    const message = isFailure ? createFailureMessage(result) : createSuccessMessage(result);
    // tslint:disable-next-line:no-console
    console.log(message);
  }

  public finalize(): Promise<void> {
    return Promise.resolve();
  }
}
