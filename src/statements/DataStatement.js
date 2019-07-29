import { BaseStatement, StatementType } from '../statement';

export class DataStatement extends BaseStatement {
  constructor(list) {
    super(StatementType.DATA);
    this.list = list;
  }

  exec(program, context) {
    throw new Error('DATA is not implemented');
  }
}
