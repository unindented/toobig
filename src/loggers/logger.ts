export interface Result {
  readonly path: string;
  readonly size: number;
  readonly maxSize: number;
}

export interface Logger {
  log(result: Result): void;
  finalize(): Promise<void>;
}
