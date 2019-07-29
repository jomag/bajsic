import { BaseStatement, StatementType } from '../statement';

export class ReadStatement extends BaseStatement {
  constructor(list) {
    super(StatementType.READ);
    this.list = list;
  }

  exec(program, context) {
    throw new Error('Read is not implemented');
  }
}
