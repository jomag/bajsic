import { BaseStatement, StatementType } from '../statement';

export class IfStatement extends BaseStatement {
  constructor(conditionExpr, thenStatements, elseStatements) {
    super(StatementType.IF);
    this.conditionExpr = conditionExpr;
    this.thenStatements = thenStatements;
    this.elseStatements = elseStatements;
  }

  async exec(program, context) {
    const result = await this.conditionExpr.evaluate(program, context);
    const block = result.isTrue() ? this.thenStatements : this.elseStatements;

    for (const stmt of block || []) {
      const jumpTo = await stmt.exec(program, context);
      if (jumpTo !== undefined) {
        return jumpTo;
      }
    }

    return undefined;
  }
}
