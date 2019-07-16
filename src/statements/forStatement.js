import { BaseStatement, StatementType } from '../statement';

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

  exec(program, context) {
    if (this.statement) {
      const start = this.startExpr.evaluate(context);
      const final = this.finalExpr.evaluate(context);
      const step = this.stepExpr
        ? this.stepExpr.evaluate(context)
        : new Value(ValueType.INT, 1);

      context.assignVariable(this.name, start);
      let nextValue = start;

      while (nextValue.isLessThan(final)) {
        context.assignVariable(this.name, nextValue);

        const jumpTo = evaluate(this.statement, program, context);
        if (jumpTo) {
          return jumpTo;
        }

        nextValue = nextValue.add(step);
      }
    } else {
      console.error('For loops not implemented yet!');
    }
  }
}
