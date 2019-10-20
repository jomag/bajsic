import { BaseStatement, StatementType } from '../statement';
import { Keyword } from '../lex';
import { RuntimeError } from '../error';

export class EndStatement extends BaseStatement {
  constructor(blockType) {
    super(StatementType.END);
    this.blockType = blockType;
  }

  async exec(program) {
    switch (this.blockType) {
      case null:
      case Keyword.PROGRAM:
      case Keyword.FUNCTION: // <-- temporary!
        // Jump to end of program
        return program.statements.length;

      default:
        throw new RuntimeError(
          `Unsupported end of block type: ${this.blockType}`
        );
    }
  }
}
