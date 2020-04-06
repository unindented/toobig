import {
  TableBorder,
  TableBorderTemplate,
  TableDrawHorizontalLine,
  TableUserConfig,
  getBorderCharacters as getBorderCharactersBuiltin,
  table,
} from "table";

import {
  endOutputStream,
  getOutputContext,
  getOutputStream,
  supportsColor,
} from "../shared";
import {
  OutputContext,
  OutputStream,
  Reporter,
  Results,
  ResultsContext,
  ResultsWithBaselinesContext,
} from "../types";

import {
  formatBaselineDifference,
  formatBaselineDifferenceArrow,
  formatBaselineSize,
  formatMaxSize,
  formatMaxSizeMark,
  formatPath,
  formatSize,
  formatTotalBaselinesDifference,
  formatTotalBaselinesDifferenceArrow,
  formatTotalBaselinesSize,
  formatTotalResultsSize,
} from "./shared";

export interface TableReporterOptions {
  readonly template?: TableBorderTemplate | "jest" | "markdown";
  readonly color?: boolean;
  readonly maxPathLength?: number;
  readonly output?: string | NodeJS.WritableStream;
}

export default class TableReporter implements Reporter {
  private readonly template: Required<TableReporterOptions>["template"];
  private readonly userConfig: TableUserConfig;
  private readonly outputContext: OutputContext;
  private readonly outputStream: OutputStream;

  public constructor({
    template = "jest",
    color = Boolean(supportsColor),
    maxPathLength = Infinity,
    output = "stdout",
  }: TableReporterOptions = {}) {
    this.template = template;
    this.userConfig = getUserConfig(template);
    this.outputContext = getOutputContext({
      supportsColor: color,
      maxLength: maxPathLength,
    });
    this.outputStream = getOutputStream(output);
  }

  public onRunStart(): void {}

  public onResult(): void {}

  public onRunComplete(results: Results, baselines?: Results): void {
    const context = {
      results,
      baselines,
      outputContext: this.outputContext,
    };

    const header = getHeader(context);
    const body = getBody(context);
    const footer = getFooter(context);
    const output = table([header, ...body, footer], this.userConfig);
    const fixedOutput =
      this.template === "markdown"
        ? fixMarkdownAlignments(output, this.userConfig)
        : output;

    this.outputStream.write(fixedOutput + "\n");
    endOutputStream(this.outputStream);
  }
}

const columnsConfig: TableUserConfig = {
  columnDefault: {
    alignment: "right",
  },
  columns: {
    0: {
      alignment: "left",
    },
  },
};

const getUserConfig = (
  template: Required<TableReporterOptions>["template"]
): TableUserConfig => {
  return {
    ...columnsConfig,
    border: getBorderCharacters(template),
    drawHorizontalLine: getDrawHorizontalLine(template),
  };
};

const jestTemplate: TableBorder = {
  topBody: "-",
  topJoin: "|",
  topLeft: "",
  topRight: "",
  bottomBody: "-",
  bottomJoin: "|",
  bottomLeft: "",
  bottomRight: "",
  bodyLeft: "",
  bodyRight: "",
  bodyJoin: "|",
  joinBody: "-",
  joinLeft: "",
  joinRight: "",
  joinJoin: "|",
};

const markdownTemplate: TableBorder = {
  topBody: "",
  topJoin: "",
  topLeft: "",
  topRight: "",
  bottomBody: "",
  bottomJoin: "",
  bottomLeft: "",
  bottomRight: "",
  bodyLeft: "|",
  bodyRight: "|",
  bodyJoin: "|",
  joinBody: "-",
  joinLeft: "|",
  joinRight: "|",
  joinJoin: "|",
};

const getBorderCharacters = (
  template: Required<TableReporterOptions>["template"]
): TableBorder =>
  template === "jest"
    ? jestTemplate
    : template === "markdown"
    ? markdownTemplate
    : getBorderCharactersBuiltin(template);

const getDrawHorizontalLine = (
  template: Required<TableReporterOptions>["template"]
): TableDrawHorizontalLine => (index: number, size: number): boolean =>
  index === 0 ||
  index === 1 ||
  (template !== "markdown" && index === size - 1) ||
  index === size;

const headerWithBaselines = [
  "Path",
  "Base Size",
  "New Size",
  "Difference",
  "Max Size",
];
const headerWithoutBaselines = ["Path", "Size", "Max Size"];

const getHeader = ({ baselines, outputContext }: ResultsContext): string[] => {
  const { colors } = outputContext;
  const bold = (str: string): string => colors.bold(str);
  const header = baselines ? headerWithBaselines : headerWithoutBaselines;
  return header.map(bold);
};

const getBody = ({
  results,
  baselines,
  outputContext,
}: ResultsContext): readonly string[][] =>
  baselines
    ? getBodyWithBaselines({ results, baselines, outputContext })
    : getBodyWithoutBaselines({ results, outputContext });

const getBodyWithBaselines = ({
  results,
  baselines,
  outputContext,
}: ResultsWithBaselinesContext): string[][] =>
  Object.values(results).map((result) => {
    const baseline = baselines[result.path];

    const resultContext = { result, baseline, outputContext };

    const path = formatPath(resultContext);
    const baselineSize = formatBaselineSize(resultContext);
    const size = formatSize(resultContext);
    const difference = `${formatBaselineDifference(
      resultContext
    )} ${formatBaselineDifferenceArrow(resultContext)}`;
    const maxSize = `${formatMaxSize(resultContext)} ${formatMaxSizeMark(
      resultContext
    )}`;

    return [path, baselineSize, size, difference, maxSize];
  });

const getBodyWithoutBaselines = ({
  results,
  outputContext,
}: ResultsContext): string[][] =>
  Object.values(results).map((result) => {
    const resultContext = { result, outputContext };

    const path = formatPath(resultContext);
    const size = formatSize(resultContext);
    const maxSize = `${formatMaxSize(resultContext)} ${formatMaxSizeMark(
      resultContext
    )}`;

    return [path, size, maxSize];
  });

const getFooter = ({
  results,
  baselines,
  outputContext,
}: ResultsContext): string[] => {
  const { colors } = outputContext;
  const bold = (str: string): string => colors.bold(str);
  const footer = baselines
    ? getFooterWithBaselines({ results, baselines, outputContext })
    : getFooterWithoutBaselines({ results, outputContext });
  return footer.map(bold);
};

const getFooterWithBaselines = (
  context: ResultsWithBaselinesContext
): string[] => [
  "",
  formatTotalBaselinesSize(context),
  formatTotalResultsSize(context),
  `${formatTotalBaselinesDifference(
    context
  )} ${formatTotalBaselinesDifferenceArrow(context)}`,
  "",
];

const getFooterWithoutBaselines = (context: ResultsContext): string[] => [
  "",
  formatTotalResultsSize(context),
  "",
];

const alignmentFixes = {
  left: {
    regex: /\|--/gu,
    replacement: "|:-",
  },
  right: {
    regex: /--\|/gu,
    replacement: "-:|",
  },
};

const fixMarkdownAlignments = (
  output: string,
  userConfig: TableUserConfig
): string => {
  let fixedOutput = output;
  fixedOutput = fixMarkdownAlignment(fixedOutput, "left", userConfig);
  fixedOutput = fixMarkdownAlignment(fixedOutput, "right", userConfig);
  return fixedOutput;
};

// istanbul ignore next
const fixMarkdownAlignment = (
  output: string,
  alignment: "left" | "right",
  { columnDefault = {}, columns = {} }: TableUserConfig
): string => {
  const { alignment: defaultAlignment } = columnDefault;
  const { regex, replacement } = alignmentFixes[alignment];

  let index = 0;

  return output.replace(regex, (match) => {
    const columnAlignment = columns[index]?.alignment;
    const needsReplacing =
      columnAlignment === alignment ||
      columnAlignment === "center" ||
      (columnAlignment === undefined &&
        (defaultAlignment === alignment || defaultAlignment === "center"));

    index++;

    return needsReplacing ? replacement : match;
  });
};
