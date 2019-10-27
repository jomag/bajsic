import { BaseStatement, StatementType } from '../statement';

export class ListStatement extends BaseStatement {
  constructor(ranges) {
    super(StatementType.LIST);
    this.ranges = ranges;
  }

  async exec(program, context) {
    if (this.ranges.length === 0) {
      program.lines.forEach(line =>
        context.support.print(0, `${line.source}\n`)
      );
    } else {
      for (const range of this.ranges) {
        const lines = program.getRange(range[0], range[1]);
        lines.forEach(line => context.support.print(0, `${line.source}\n`));
      }
    }
  }
}
