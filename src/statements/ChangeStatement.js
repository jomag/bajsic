import { BaseStatement, StatementType } from '../statement';

export class ChangeStatement extends BaseStatement {
  constructor(fromExpr, toName) {
    super(StatementType.CHANGE);
    this.fromExpr = fromExpr;
    this.toName = toName;
  }

  exec(program, context) {
    throw new Error('CHANGE is not implemented');
  }
}
