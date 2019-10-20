import { StatementType, BaseStatement } from '../statement';
import { Expr } from '../expr';
import { TypeMismatchError } from '../error';
import { Program } from '../program';
import { Context } from '../context';

export class BaseOnStatement extends BaseStatement {
  /**
   * @param {StatementType} type
   * @param {Expr} expr
   * @param {number[]} targets
   * @param {number} otherwise
   */
  constructor(type, expr, targets, otherwise) {
    super(type);
    this.expr = expr;
    this.targets = targets;
    this.otherwise = otherwise;
  }

  /**
   * @param {Program} program
   * @param {Context} context
   * @returns {Promise<number>}
   */
  async getTarget(program, context) {
    const x = await this.expr.evaluate(program, context);

    if (!x.isNumeric()) {
      throw new TypeMismatchError(`Expected numeric value`);
    }

    const index = Math.floor(x.value) - 1;

    if (index >= 0 && index < this.targets.length) {
      return [program.lineNumberToIndex(this.targets[index]), 0];
    }
  }
}
