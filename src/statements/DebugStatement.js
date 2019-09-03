import { BaseStatement, StatementType } from '../statement';
import Debugger from '../debugger';

export class DebugStatement extends BaseStatement {
  constructor() {
    super(StatementType.DEBUG);
  }

  async exec(program, context) {
    const dbg = new Debugger();
    await dbg.enter(program, context);
  }
}
