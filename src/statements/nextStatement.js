import { BaseStatement, StatementType } from '../statement';

export class NextStatement extends BaseStatement {
  constructor(name) {
    super(StatementType.NEXT);
    this.name = name;
  }

  exec(program, context) {
    throw new Error('NEXT is not implemented');
  }
}
