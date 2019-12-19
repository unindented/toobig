import { Logger, Result } from './logger';

export default class CompositeLogger implements Logger {
  private readonly loggers: Logger[];

  constructor(...loggers: Logger[]) {
    this.loggers = loggers;
  }

  public log(result: Result): void {
    this.loggers.forEach(logger => {
      logger.log(result);
    });
  }

  public async finalize(): Promise<void> {
    const promises = this.loggers.map(logger => logger.finalize());
    await Promise.all(promises);
  }
}
