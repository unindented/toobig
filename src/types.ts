import { Chalk } from "chalk";

export interface CommonConfig {
  reporters?: ReporterConfig[];
}

export interface ScanConfig extends CommonConfig {
  budgets: BudgetsConfig;
  cwd?: string;
}

export interface LoadConfig extends CommonConfig {
  input: string | Result[];
}

export interface BudgetsConfig {
  [path: string]: string;
}

export type ReporterConfig = string | [string, object];

export interface Result {
  readonly path: string;
  readonly size: number;
  readonly maxSize: number;
}

export interface ReturnValue {
  results: Result[];
  anyOverBudget: boolean;
}

export interface ReporterConstructor {
  new (options?: object): Reporter;
}

export interface Reporter {
  onRunStart(): Promise<void> | void;
  onResult(result: Result): Promise<void> | void;
  onRunComplete(results: Result[]): Promise<void> | void;
}

export interface OutputContext {
  colors: Chalk;
  colorOverride?: Chalk;
}

export type InputStream = NodeJS.ReadableStream;

export type OutputStream = NodeJS.WritableStream;
