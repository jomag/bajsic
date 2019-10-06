import { BaseOnStatement } from './BaseOnStatement';
import { StatementType } from '../statement';
import { Expr } from '../expr';

export class OnGotoStatement extends BaseOnStatement {
  /**
   * @param {Expr} expr
   * @param {number[]} targets
   * @param {number} otherwise
   */
  constructor(expr, targets, otherwise) {
    super(StatementType.ON_GOTO, expr, targets, otherwise);
  }

  async exec(program, context) {
    return this.getTarget(program, context);
  }
}
