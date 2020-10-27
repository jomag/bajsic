import { BaseStatement, StatementType } from '../statement';
import BasicArray from '../BasicArray';
import { Context } from '../context';
import { Program } from '../program';
import { valueTypeFromName } from '../Var';

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
      const valueType = valueTypeFromName(name);
      context.assignArray(name, new BasicArray(valueType, this.arrays[name]));
    }
  }
}
