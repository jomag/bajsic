// @ts-check

import Var from '../Var';
import { Expr } from '../expr';
import { Program } from '../program';
import { Context } from '../context';
import { BaseStatement, StatementType } from '../statement';
import { assignIdentifierValue } from './utils';

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
    const result = await this.expr.evaluate(program, context);
    await assignIdentifierValue(program, context, this.identifier, result);
  }
}
