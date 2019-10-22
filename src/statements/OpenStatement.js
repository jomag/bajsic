import { BaseStatement, StatementType } from '../statement';

export class OpenStatement extends BaseStatement {
  constructor(filename, mode, channel) {
    super(StatementType.OPEN);
    this.filename = filename;
    this.mode = mode;
    this.channel = channel;
  }

  async exec(program, context) {
    const filename = this.filename.value;
    const channel = this.channel.value;
    await context.support.open(filename, this.mode, channel);
  }
}
