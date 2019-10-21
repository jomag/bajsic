import { BaseStatement, StatementType } from '../statement';

export class PrintStatement extends BaseStatement {
  constructor(channel, list) {
    super(StatementType.PRINT);
    this.channel = channel;
    this.list = list;
  }

  async exec(program, context) {
    // FIXME: handle different output channels
    for (const outp of this.list) {
      const result = await outp[0].evaluate(program, context);
      context.outputStream.write(
        outp[1] ? `${result.value}\n` : `${result.value}`
      );
    }
  }
}
