import { BaseStatement, StatementType } from '../statement';
import BasicArray from '../BasicArray';

export class DimStatement extends BaseStatement {
  constructor(arrays) {
    super(StatementType.DIM);
    this.arrays = arrays;
  }

  exec(program, context) {
    for (const name of Object.keys(this.arrays)) {
      console.warn('DimStatement always use type "number"');
      context.assignVariable(name, new BasicArray('number', this.arrays[name]));
    }
  }
}
