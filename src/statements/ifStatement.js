import { BaseStatement, StatementType } from '../statement';
import { evaluate } from '../evaluate';

export class IfStatement extends BaseStatement {
  constructor(conditionExpr, thenStatements, elseStatements) {
    super(StatementType.IF);
    this.conditionExpr = conditionExpr;
    this.thenStatements = thenStatements;
    this.elseStatements = elseStatements;
  }

  exec(program, context) {
    const result = this.conditionExpr.evaluate(context);
    const block = result.isTrue() ? this.thenStatements : this.elseStatements;

    for (let stmt of block || []) {
      const jumpTo = evaluate(stmt, program, context);
      if (jumpTo !== undefined) {
        return jumpTo;
      }
    }
  }
}
