import { BaseStatement, StatementType } from '../statement';
import { input as inputStreamInput } from '../shell';
import { assignIdentifierValue } from './utils';
import { Value, ValueType } from '../expr';

export class InputStatement extends BaseStatement {
  constructor(channel, list) {
    super(StatementType.INPUT);
    this.channel = channel;
    this.list = list;
  }

  async exec(program, context) {
    for (const q of this.list) {
      let prompt = '? ';

      if (q.str) {
        prompt = `${q.str}${prompt}`;
      }

      context.outputStream.write(prompt);

      const inp = await inputStreamInput(context.inputStream);

      await assignIdentifierValue(
        program,
        context,
        q.identifier,
        new Value(ValueType.STRING, inp)
      );
    }
  }
}

export class InputLineStatement extends InputStatement {}
