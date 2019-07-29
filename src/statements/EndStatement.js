import { BaseStatement, StatementType } from '../statement';

export class EndStatement extends BaseStatement {
  constructor(blockType) {
    super(StatementType.END);
    this.blockType = blockType;
  }

  exec(program, context) {
    throw new Error('END is not implemented');
  }
}
