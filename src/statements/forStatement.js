import { BaseStatement, StatementType } from '../statement';
import { Value, ValueType } from '../expr';
import { evaluate } from '../evaluate';

export class ForStatement extends BaseStatement {
  constructor(name, startExpr, finalExpr, stepExpr, untilExpr, whileExpr) {
    super(StatementType.FOR);
    this.name = name;
    this.startExpr = startExpr;
    this.finalExpr = finalExpr;
    this.stepExpr = stepExpr;
    this.untilExpr = untilExpr;
    this.whileExpr = whileExpr;

    // If not null, this for-loop is a statement modifier
    this.statement = null;
  }

  async exec(program, context) {
    if (this.statement) {
      const start = await this.startExpr.evaluate(context);
      const final = await this.finalExpr.evaluate(context);
      const step = this.stepExpr
        ? await this.stepExpr.evaluate(context)
        : new Value(ValueType.INT, 1);

      context.assignVariable(this.name, start);
      let nextValue = start;

      while (nextValue.isLessThan(final)) {
        context.assignVariable(this.name, nextValue);

        const jumpTo = await evaluate(this.statement, program, context);
        if (jumpTo !== undefined) {
          return jumpTo;
        }

        nextValue = nextValue.add(step);
      }
    } else {
      console.error('For loops not implemented yet!');
    }
  }
}
