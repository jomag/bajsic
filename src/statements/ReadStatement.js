import { BaseStatement, StatementType } from '../statement';
import Var from '../Var';
import { Program } from '../program';
import { Context } from '../context';
import { assignIdentifierValue } from './utils';

export class ReadStatement extends BaseStatement {
  /**
   * @param {Var[]} list
   */
  constructor(list) {
    super(StatementType.READ);

    /** @type {Var[]} list */
    this.list = list;
  }

  /**
   * @param {Program} program
   * @param {Context} context
   */
  async exec(program, context) {
    for (const variable of this.list) {
      const value = context.getData();
      await assignIdentifierValue(program, context, variable, value);
    }
  }
}
