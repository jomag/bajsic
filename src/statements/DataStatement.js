import { BaseStatement, StatementType } from '../statement';
import { Value } from '../expr';

export class DataStatement extends BaseStatement {
  /**
   * @param {Value[]} list
   */
  constructor(list) {
    super(StatementType.DATA);

    /** @type {Value[]} */
    this.list = list;
  }

  exec(program, context) {
    // Does nothing at runtime
  }
}
