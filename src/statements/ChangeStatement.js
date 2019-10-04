import { BaseStatement, StatementType } from '../statement';
import { Value, ValueType } from '../expr';
import { RuntimeError } from '../evaluate';

export class ChangeStatement extends BaseStatement {
  constructor(fromExpr, toName) {
    super(StatementType.CHANGE);
    this.fromExpr = fromExpr;
    this.toName = toName;
  }

  exec(program, context) {
    const fromValue = this.fromExpr.evaluate(program, context);

    if (fromValue.type === ValueType.STRING) {
      const str = fromValue.value;
      context.setArrayItem(
        this.toName,
        [0],
        new Value(ValueType.INT, str.length)
      );
      for (let i = 0; i < str.length; i++) {
        context.setArrayItem(
          this.toName,
          [i + 1],
          new Value(ValueType.INT, str.charCodeAt(i))
        );
      }
    } else if (fromValue.type === ValueType.ARRAY) {
      // fromValue is an int array, where the first value is the
      // number of characters, and the remaining is characters in
      // ascii code. This array should be converted to a string.
      const basicArray = fromValue.value;
      const count = basicArray.get([0]).value;
      let str = '';

      for (let i = 0; i < count; i++) {
        const n = basicArray.get([i + 1]);
        str = str + String.fromCharCode(n.value);
      }

      context.assignVariable(this.toName, new Value(ValueType.STRING, str));
    } else {
      throw new RuntimeError(
        `Invalid type in CHANGE statement: ${fromValue.type}`
      );
    }
  }
}
