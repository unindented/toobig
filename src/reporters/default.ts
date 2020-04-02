import CompositeReporter from "./composite";
import LineReporter from "./line";
import SummaryReporter from "./summary";
import TableReporter from "./table";

export default class DefaultReporter extends CompositeReporter {
  public constructor() {
    super({
      reporters: [
        new LineReporter(),
        new TableReporter(),
        new SummaryReporter(),
      ],
    });
  }
}
