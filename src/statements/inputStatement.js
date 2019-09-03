import { BaseStatement, StatementType } from '../statement';

export class InputStatement extends BaseStatement {
  constructor(channel, list) {
    super(StatementType.INPUT);
    this.channel = channel;
    this.list = list;
  }

  exec(program, context) {
    throw new Error('INPUT is not implemented');
  }
}

export class InputLineStatement extends InputStatement {}
