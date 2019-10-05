import { BaseStatement, StatementType } from '../statement';

export class ResumeStatement extends BaseStatement {
  constructor(target) {
    super(StatementType.RESUME);
    this.target = target;
  }

  exec() {
    throw new Error('RESUME is not implemented');
  }
}
