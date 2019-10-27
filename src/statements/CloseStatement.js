import { BaseStatement, StatementType } from '../statement';

export class CloseStatement extends BaseStatement {
  constructor(channel) {
    super(StatementType.CLOSE);
    this.channel = channel;
  }

  async exec(program, context) {
    await context.support.close(this.channel.value);
  }
}
