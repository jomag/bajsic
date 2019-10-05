import { BaseStatement, StatementType } from '../statement';

export class StopStatement extends BaseStatement {
  constructor() {
    super(StatementType.STOP);
  }

  exec() {
    throw new Error('STOP is not implemented');
  }
}
