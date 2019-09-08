// @ts-check

import { BaseStatement, StatementType } from '../statement';
import { Expr } from '../expr';
import { Context } from '../context';
import { Program } from '../program';

export class MarginStatement extends BaseStatement {
  /**
   * @param {Expr} channel
   * @param {Expr} expr
   */
  constructor(channel, expr) {
    super(StatementType.MARGIN);
    this.channel = channel;
    this.expr = expr;
  }

  /**
   * @param {Program} program
   * @param {Context} context
   */
  async exec(program, context) {
    const channel =
      this.channel && (await this.channel.evaluate(program, context));
    const margin = await this.expr.evaluate(program, context);
    context.options.margin = margin;
  }
}
