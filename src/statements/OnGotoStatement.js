import { BaseOnStatement } from './BaseOnStatement';
import { StatementType } from '../statement';

export class OnGotoStatement extends BaseOnStatement {
  constructor(expr, targets, otherwise) {
    super(StatementType.ON_GOTO, expr, targets, otherwise);
  }

  async exec(program, context) {
    const result = await this.expr.evaluate(program, context);
    console.warn('OnGotoStatement.exec is only a stub');
  }
}
