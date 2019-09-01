// @ts-check

import Var from '../Var';
import { Expr, ValueType } from '../expr';
import { Program } from '../program';
import { Context } from '../context';
import { BaseStatement, StatementType } from '../statement';
import { RuntimeError } from '../evaluate';

export class LetStatement extends BaseStatement {
  /**
   * @param {Var} identifier
   * @param {Expr} expr
   */
  constructor(identifier, expr) {
    super(StatementType.LET);
    this.identifier = identifier;
    this.expr = expr;
  }

  /**
   * @param {Program} program
   * @param {Context} context
   */
  async exec(program, context) {
    const result = await this.expr.evaluate(context);
    console.log(
      `this identifier: ${JSON.stringify(this.identifier)}, ${JSON.stringify(
        result
      )}`
    );
    if (this.identifier.index) {
      for (const x of this.identifier.index) {
        console.log(`idx: ${JSON.stringify(x)}`);
      }

      const index = [];
      for (const expr of this.identifier.index) {
        index.push(await expr.evaluate(context));
      }

      console.log(`index: ${JSON.stringify(index)}`);

      const numIndex = index.map(value => {
        if (value.type !== ValueType.INT) {
          throw new RuntimeError(
            'Only numeric values are allowed as array index'
          );
        }
        return value.value;
      });

      console.log(`numIndex: ${JSON.stringify(numIndex)}, ${result}`);

      context.setArrayItem(this.identifier.name, numIndex, result);
    } else {
      context.assignVariable(this.identifier.name, result);
    }
  }
}
