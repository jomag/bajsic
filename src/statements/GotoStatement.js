import { BaseStatement, StatementType } from '../statement';
import { RuntimeError } from '../error';

export class GotoStatement extends BaseStatement {
  constructor(label) {
    super(StatementType.GOTO);
    this.label = label;
  }

  async exec(program) {
    const target = program.labels[this.label];

    if (target === undefined) {
      throw new RuntimeError(`Undefined line: ${target}`);
    }

    return target;
  }
}
