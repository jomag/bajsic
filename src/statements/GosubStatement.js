import { BaseStatement, StatementType } from '../statement';
import { RuntimeError } from '../error';

export class GosubStatement extends BaseStatement {
  constructor(destination) {
    super(StatementType.GOSUB);
    this.destination = destination;
  }

  exec(program, context) {
    context.pushGosub([context.cursor[0], context.cursor[1] + 1]);
    const lineIndex = program.lineNumberToIndex(this.destination);

    if (lineIndex === undefined) {
      throw new RuntimeError(`Undefined line: ${lineIndex}`);
    }

    return [lineIndex, 0];
  }
}
