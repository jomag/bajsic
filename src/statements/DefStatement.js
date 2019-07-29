import { BaseStatement, StatementType } from '../statement';

export class DefStatement extends BaseStatement {
  constructor(dataType, name, args) {
    super(StatementType.DEF);
    this.dataType = dataType;
    this.name = name;
    this.args = args;
  }

  exec(program, context) {
    throw new Error('DEF is not implemented');
  }
}
