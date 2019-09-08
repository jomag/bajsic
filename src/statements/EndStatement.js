import { BaseStatement, StatementType } from '../statement';
import { Keyword } from '../lex';
import { RuntimeError } from '../evaluate';

export class EndStatement extends BaseStatement {
  constructor(blockType) {
    super(StatementType.END);
    this.blockType = blockType;
  }

  exec(program, context) {
    switch (this.blockType) {
      case null:
      case Keyword.PROGRAM:
      case Keyword.FUNCTION: // <-- temporary!
        // Return null to stop program execution
        return null;

      default:
        throw new RuntimeError(
          `Unsupported end of block type: ${this.blockType}`
        );
    }
  }
}
