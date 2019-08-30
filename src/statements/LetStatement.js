import { BaseStatement, StatementType } from '../statement';

export class LetStatement extends BaseStatement {
  constructor(identifier, expr) {
    super(StatementType.LET);
    this.identifier = identifier;
    this.expr = expr;
  }

  async exec(program, context) {
    const result = await this.expr.evaluate(context);
    console.log(this.identifier);
    if (this.identifier.index) {
      context.setArrayItem(this.identifier.name, this.identifier.index, result);
    } else {
      context.assignVariable(this.identifier.name, result);
    }
  }
}
