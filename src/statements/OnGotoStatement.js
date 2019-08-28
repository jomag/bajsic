import { BaseOnStatement } from './BaseOnStatement';
import { StatementType } from '../statement';

export class OnGotoStatement extends BaseOnStatement {
  constructor(expr, targets, otherwise) {
    super(StatementType.ON_GOTO, expr, targets, otherwise);
  }

  exec(program, context) {
    const result = this.expr.evaluate(context);
    console.warn('OnGotoStatement.exec is only a stub');
  }
}
