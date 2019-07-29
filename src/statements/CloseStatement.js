import { BaseStatement, StatementType } from '../statement';

export class CloseStatement extends BaseStatement {
  constructor(channel) {
    super(StatementType.CLOSE);
    this.channel = channel;
  }

  exec(program, context) {
    throw new Error('CLOSE is not implemented');
  }
}
