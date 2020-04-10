import { Chalk } from "chalk";

export interface CommonConfig {
  readonly baselines?: string | Results;
  readonly reporters?: readonly ReporterConfig[];
}

export interface ScanConfig extends CommonConfig {
  readonly budgets: BudgetsConfig;
  readonly cwd?: string;
}

export interface LoadConfig extends CommonConfig {
  readonly results: string | Results;
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

export type InputStream = NodeJS.ReadableStream;

export type OutputStream = NodeJS.WritableStream;

export interface ReporterConstructor {
  new (options?: object): Reporter;
}

export interface Reporter {
  onRunStart(): Promise<void> | void;
  onResult(result: Result, baseline?: Result): Promise<void> | void;
  onRunComplete(results: Results, baselines?: Results): Promise<void> | void;
}

export interface OutputContext {
  readonly colors: Chalk;
  readonly colorOverride?: Chalk;
  readonly maxPathLength: number;
  readonly verbose: boolean;
}

export interface ResultsContext {
  readonly results: Results;
  readonly baselines?: Results;
  readonly outputContext: OutputContext;
}

export type ResultsWithBaselinesContext = Required<ResultsContext>;

export interface ResultContext {
  readonly result: Result;
  readonly baseline?: Result;
  readonly outputContext: OutputContext;
}

export type ResultWithBaselineContext = Required<ResultContext>;
