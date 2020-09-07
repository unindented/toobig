import { Chalk } from "chalk";

export interface CommonConfig {
  readonly projectName?: string;
  readonly baselines?: string | ProjectResults;
  readonly reporters?: readonly ReporterConfig[];
}

export interface CommonScanConfig extends CommonConfig {
  readonly projectDir?: string;
}

export interface SimpleScanConfig extends CommonScanConfig {
  readonly budgets: BudgetsConfig;
}

export interface MultiScanConfig extends CommonScanConfig {
  readonly projects: readonly string[];
}

export type ScanConfig = SimpleScanConfig | MultiScanConfig;

export interface LoadConfig extends CommonConfig {
  readonly results: string | ProjectResults;
}

export interface BudgetsConfig {
  readonly [path: string]: string;
}

export type ReporterConfig = string | readonly [string, object];

export interface CommonProjectResults {
  readonly projectName?: string;
}

export interface SimpleProjectResults extends CommonProjectResults {
  readonly entries: Entries;
}

export interface MultiProjectResults extends CommonProjectResults {
  readonly projects: readonly SimpleProjectResults[];
}

export type ProjectResults = SimpleProjectResults | MultiProjectResults;

export interface Entries {
  readonly [path: string]: Entry;
}

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type WritableEntries = Writable<Entries>;

export interface Entry {
  readonly path: string;
  readonly size: number;
  readonly maxSize: number;
}

export interface ReturnValues {
  readonly results: ProjectResults;
  readonly anyOverBudget: boolean;
  readonly anyUnderBaseline: boolean;
  readonly anyOverBaseline: boolean;
}

export type InputStream = NodeJS.ReadableStream;

export type OutputStream = NodeJS.WritableStream;

export interface ReporterConstructor {
  new (options?: object): Reporter;
}

export interface Reporter {
  onRunStart(): Promise<void> | void;
  onResult(result: Entry, baseline?: Entry): Promise<void> | void;
  onRunComplete(
    results: ProjectResults,
    baselines?: ProjectResults
  ): Promise<void> | void;
}

export interface OutputContext {
  readonly colors: Chalk;
  readonly colorOverride?: Chalk;
  readonly maxPathLength: number;
  readonly verbose: boolean;
}

export interface ResultsContext {
  readonly results: ProjectResults;
  readonly baselines?: ProjectResults;
  readonly outputContext: OutputContext;
}

export type ResultsWithBaselinesContext = Required<ResultsContext>;

export interface EntryContext {
  readonly result: Entry;
  readonly baseline?: Entry;
  readonly outputContext: OutputContext;
}

export type EntryWithBaselineContext = Required<EntryContext>;

export function isSimpleScanConfig(
  config: ScanConfig
): config is SimpleScanConfig {
  return Object.prototype.hasOwnProperty.call(config, "budgets");
}

export function isMultiScanConfig(
  config: ScanConfig
): config is MultiScanConfig {
  return Object.prototype.hasOwnProperty.call(config, "projects");
}

export function isSimpleProjectResults(
  results: ProjectResults
): results is SimpleProjectResults {
  return Object.prototype.hasOwnProperty.call(results, "entries");
}

export function isMultiProjectResults(
  results: ProjectResults
): results is MultiProjectResults {
  return Object.prototype.hasOwnProperty.call(results, "projects");
}
