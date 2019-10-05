import { BaseStatement, StatementType } from '../statement';
import BasicArray from '../BasicArray';
import { ValueType } from '../expr';
import { Context } from '../context';
import { Program } from '../program';

export class DimStatement extends BaseStatement {
  constructor(arrays) {
    super(StatementType.DIM);
    this.arrays = arrays;
  }

  /**
   * @param {Program} program
   * @param {Context} context
   */
  exec(program, context) {
    for (const name of Object.keys(this.arrays)) {
      console.warn('DimStatement always use type "number"');

      // FIXME: does not handle explicit data types
      let dataType = ValueType.INT;

      if (name.endsWith('$')) {
        dataType = ValueType.STRING;
      } else if (name.endsWith('%')) {
        dataType = ValueType.INT;
      }

      context.assignArray(name, new BasicArray(dataType, this.arrays[name]));
    }
  }
}
