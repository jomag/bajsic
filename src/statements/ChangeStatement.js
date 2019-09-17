import { BaseStatement, StatementType } from '../statement';
import { Value, ValueType } from '../expr';

export class ChangeStatement extends BaseStatement {
  constructor(fromExpr, toName) {
    super(StatementType.CHANGE);
    this.fromExpr = fromExpr;
    this.toName = toName;
  }

  exec(program, context) {
    console.log("CHANGE:");
    const fromValue = this.fromExpr.evaluate(program, context);
    console.log(" - FROM VALUE: ", fromValue);

    if (fromValue.type === ValueType.STRING) {
      const str = fromValue.value;
      console.log(" - TARGET: ", this.toName);
      context.setArrayItem(this.toName, [1], new Value(ValueType.INT, str.length));
    }
  }
}
