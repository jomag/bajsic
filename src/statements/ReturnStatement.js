import { BaseStatement, StatementType } from '../statement';

export class ReturnStatement extends BaseStatement {
  constructor() {
    super(StatementType.RETURN);
  }

  exec(program, context) {
    return context.popGosub();
  }
}
