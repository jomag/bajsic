import { BaseStatement, StatementType } from '../statement';

export class EndStatement extends BaseStatement {
  constructor(blockType) {
    super(StatementType.END);
    this.blockType = blockType;
  }

  exec(program, context) {
    switch (this.blockType) {
      case null:
      case Keyword.PROGRAM:
        // Return null to stop program execution
        return null;

      default:
        throw new RuntimeError(
          `Unsupported end of block type: ${this.blockType}`
        );
    }
  }
}
