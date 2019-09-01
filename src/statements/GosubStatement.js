import { BaseStatement, StatementType } from '../statement';

export class GosubStatement extends BaseStatement {
  constructor(destination) {
    super(StatementType.GOSUB);
    this.destination = destination;
  }

  exec(program, context) {
    context.push(program.lineIndexToNumber(context.pc + 1));
    return this.destination;
  }
}
