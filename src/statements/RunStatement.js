import { BaseStatement, StatementType } from '../statement';
import { evaluate } from '../eval';

export class RunStatement extends BaseStatement {
  constructor() {
    super(StatementType.RUN);
  }

  async exec(program, context) {
    if (program.modified) {
      program.flatten();
    }
    context.prepare(program);
    await evaluate(program, context);
    context.support.clearInputBuffer();
  }
}
