import { BaseStatement, StatementType } from '../statement';
import { Value, ValueType } from '../expr';

export class NextStatement extends BaseStatement {
  constructor(name) {
    super(StatementType.NEXT);
    this.name = name.value.toUpperCase();
  }

  exec(program, context) {
    while (true) {
      const info = context.popForLoop();

      if (!info) {
        break;
      }

      if (info.name === this.name) {
        const val = context.get(this.name);
        let ival = val.value;
        ival = ival + info.step;
        context.assignVariable(this.name, new Value(ValueType.INT, ival));
        if (ival <= info.final) {
          context.pushForLoop(info);
          return info.entry;
        }
      }
    }
  }
}
