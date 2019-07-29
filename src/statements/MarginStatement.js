import { BaseStatement, StatementType } from '../statement';

export class MarginStatement extends BaseStatement {
  constructor(channel, expr) {
    super(StatementType.MARGIN);
    this.channel = channel;
    this.expr = expr;
  }

  exec(program, context) {
    throw new Error('MARGIN is not implemented');
  }
}
