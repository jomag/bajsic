import { BaseStatement, StatementType } from '../statement';
import { Value } from '../Value';

export class DataStatement extends BaseStatement {
  /**
   * @param {Value[]} list
   */
  constructor(list) {
    super(StatementType.DATA);

    /** @type {Value[]} */
    this.list = list;
  }

  exec() {
    // Does nothing at runtime
  }
}
