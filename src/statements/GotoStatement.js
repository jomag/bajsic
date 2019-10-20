import { BaseStatement, StatementType } from '../statement';
import { RuntimeError } from '../error';

export class GotoStatement extends BaseStatement {
  constructor(destination) {
    super(StatementType.GOTO);
    this.destination = destination;
  }

  async exec(program) {
    const lineIndex = program.lineNumberToIndex(this.destination);

    if (lineIndex === undefined) {
      throw new RuntimeError(`Undefined line: ${lineIndex}`);
    }

    return [lineIndex, 0];
  }
}
