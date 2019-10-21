import { BaseStatement, StatementType } from '../statement';
import { RuntimeError } from '../error';

export class GosubStatement extends BaseStatement {
  constructor(destination) {
    super(StatementType.GOSUB);
    this.destination = destination;
  }

  exec(program, context) {
    context.push(context.pc + 1);
    const target = program.labels[this.destination];

    if (target === undefined) {
      throw new RuntimeError(`Undefined line: ${target}`);
    }

    return target;
  }
}
