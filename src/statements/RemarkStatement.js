import { BaseStatement, StatementType } from '../statement';

export class RemarkStatement extends BaseStatement {
  constructor() {
    super(StatementType.REMARK);
  }

  exec() {
    // Does nothing at runtime
  }
}
