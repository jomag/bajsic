import { BaseStatement, StatementType } from '../statement';
import { Value, ValueType, ExprType } from '../expr';
import { RuntimeError } from '../error';

export class ChangeStatement extends BaseStatement {
  /**
   * The from-expression must be either a variable name,
   * pointing to an array or a string, or a string value.
   * @param {Expr} fromExpr
   * @param {*} toName
   */
  constructor(fromExpr, toName) {
    super(StatementType.CHANGE);
    this.fromExpr = fromExpr;
    this.toName = toName;
  }

  exec(program, context) {
    let fromArray;
    let fromString;

    if (this.fromExpr.type === ExprType.IDENT) {
      const name = this.fromExpr.value;
      fromArray = context.getArray(name);
      if (!fromArray) {
        fromString = context.get(name);
      }
    } else if (this.fromExpr.type === ExprType.CONST) {
      fromString = this.fromExpr.value;
    }

    if (fromString && fromString.type === ValueType.STRING) {
      const str = fromString.value;
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
      return;
    }

    if (fromArray) {
      // fromValue is an int array, where the first value is the
      // number of characters, and the remaining is characters in
      // ascii code. This array should be converted to a string.
      const count = fromArray.get([0]).value;
      let str = '';

      for (let i = 0; i < count; i++) {
        const n = fromArray.get([i + 1]);
        str = str + String.fromCharCode(n.value);
      }

      context.assignVariable(this.toName, new Value(ValueType.STRING, str));
      return;
    }

    console.log(this.fromExpr);
    console.log('fromArray', fromArray);
    console.log('fromString', fromString);
    throw new RuntimeError('Invalid source expression in CHANGE statement');
  }
}
