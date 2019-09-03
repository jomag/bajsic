import { BaseStatement, StatementType } from '../statement';

export class WriteStatement extends BaseStatement {
  constructor(channel, data) {
    super(StatementType.WRITE);
    this.channel = channel;
    this.data = data;
  }

  exec(program, context) {
    throw new Error('WRITE is not implemented');
  }
}
