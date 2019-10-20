import { BaseStatement, StatementType } from '../statement';
import { RuntimeError } from '../error';

export class BranchStatement extends BaseStatement {
  constructor(expr, thenLabel, elseLabel) {
    super(StatementType.BRANCH);
    this.expr = expr;
    this.thenLabel = thenLabel;
    this.elseLabel = elseLabel;
  }

  async exec(program, context) {
    const result = await this.expr.evaluate(program, context);
    const label = result.isTrue() ? this.thenLabel : this.elseLabel;
    const jumpTo = program.labels[label];

    if (jumpTo === undefined) {
      throw new RuntimeError(`Undefined line number/label: ${label}`);
    }

    return jumpTo;
  }
}
