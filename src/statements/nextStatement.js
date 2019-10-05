import { BaseStatement, StatementType } from '../statement';
import { Value, ValueType } from '../Value';
import { NextWithoutForError } from '../error';

export class NextStatement extends BaseStatement {
  constructor(name) {
    super(StatementType.NEXT);
    this.name = name.value.toUpperCase();
  }

  exec(program, context) {
    for (;;) {
      const info = context.popForLoop();

      if (!info) {
        throw new NextWithoutForError(context, program);
      }

      if (info && info.name === this.name) {
        const val = context.get(this.name);
        let ival = val.value;
        ival += info.step;
        context.assignVariable(this.name, new Value(ValueType.INT, ival));
        if (ival <= info.final) {
          context.pushForLoop(info);
          return info.entry;
        }
        break;
      }
    }
  }
}
