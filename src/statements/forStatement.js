import { BaseStatement, StatementType } from '../statement';
import { Value, ValueType } from '../Value';

export class ForStatement extends BaseStatement {
  constructor(name, startExpr, finalExpr, stepExpr, untilExpr, whileExpr) {
    super(StatementType.FOR);
    this.name = name.toUpperCase();
    this.startExpr = startExpr;
    this.finalExpr = finalExpr;
    this.stepExpr = stepExpr;
    this.untilExpr = untilExpr;
    this.whileExpr = whileExpr;

    // If not null, this for-loop is a statement modifier
    this.statement = null;
  }

  async exec(program, context) {
    const start = await this.startExpr.evaluate(program, context);
    const final = await this.finalExpr.evaluate(program, context);
    const step = this.stepExpr
      ? await this.stepExpr.evaluate(program, context)
      : new Value(ValueType.INT, 1);

    context.assignVariable(this.name, start);

    if (this.statement) {
      let nextValue = start;

      while (nextValue.isLessThan(final)) {
        context.assignVariable(this.name, nextValue);

        const jumpTo = await this.statement.exec(program, context);

        if (jumpTo !== undefined) {
          return jumpTo;
        }

        nextValue = nextValue.add(step);
      }
    } else {
      context.pushForLoop({
        name: this.name,
        start: start.value,
        final: final.value,
        step: step.value,
        entry: [context.cursor[0], context.cursor[1] + 1],
      });
    }

    return undefined;
  }
}
