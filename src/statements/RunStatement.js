import { BaseStatement, StatementType } from '../statement';
import { evaluate } from '../eval';

export class RunStatement extends BaseStatement {
  constructor() {
    super(StatementType.RUN);
  }

  async exec(program, context) {
    context.prepare(program);
    await evaluate(program, context);
  }
}
