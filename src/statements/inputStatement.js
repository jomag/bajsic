import { BaseStatement, StatementType } from '../statement';
import { assignIdentifierValue } from './utils';
import { Value, ValueType } from '../Value';

export class InputStatement extends BaseStatement {
  constructor(channel, list) {
    super(StatementType.INPUT);
    this.channel = channel;
    this.list = list;
  }

  async exec(program, context) {
    const prompt = this.channel === undefined && '? ';

    for (const q of this.list) {
      if (prompt) {
        context.support.print(0, `${q.str || ''}${prompt}`, false);
      }

      const inp = await context.support.readLine(
        this.channel ? this.channel.value : 0
      );
      const trimmed = inp.replace(/\n$/, '');

      let val;
      if (q.identifier.getType() !== ValueType.STRING) {
        val = new Value(ValueType.INT, Number(trimmed));
      } else {
        val = new Value(ValueType.STRING, trimmed);
      }

      await assignIdentifierValue(program, context, q.identifier, val);
    }
  }
}

export class InputLineStatement extends InputStatement {}
