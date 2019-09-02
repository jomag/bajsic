import { BaseStatement, StatementType } from '../statement';
import BasicArray from '../BasicArray';
import { Value, ValueType } from '../expr';
import io from '../io';
import { RuntimeError } from '../evaluate';

export class DimStatement extends BaseStatement {
  constructor(arrays) {
    super(StatementType.DIM);
    this.arrays = arrays;
  }

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

      context.assignVariable(
        name,
        new Value(ValueType.ARRAY, new BasicArray(dataType, this.arrays[name]))
      );
    }
  }
}
