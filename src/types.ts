import { Chalk } from "chalk";

export interface CommonConfig {
  readonly reporters?: readonly ReporterConfig[];
}

export interface ScanConfig extends CommonConfig {
  readonly budgets: BudgetsConfig;
  readonly cwd?: string;
}

export interface LoadConfig extends CommonConfig {
  readonly input: string | Results;
}

export interface BudgetsConfig {
  readonly [path: string]: string;
}

export type ReporterConfig = string | readonly [string, object];

export interface Results {
  readonly [path: string]: Result;
}

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type WritableResults = Writable<Results>;

export interface Result {
  readonly path: string;
  readonly size: number;
  readonly maxSize: number;
}

export interface ReturnValue {
  readonly results: Results;
  readonly anyOverBudget: boolean;
}

export interface ReporterConstructor {
  new (options?: object): Reporter;
}

export interface Reporter {
  onRunStart(): Promise<void> | void;
  onResult(result: Result): Promise<void> | void;
  onRunComplete(results: Results): Promise<void> | void;
}

export interface OutputContext {
  readonly colors: Chalk;
  readonly colorOverride?: Chalk;
}

export type InputStream = NodeJS.ReadableStream;

export type OutputStream = NodeJS.WritableStream;
