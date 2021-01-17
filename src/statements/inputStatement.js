import { BaseStatement, StatementType } from '../statement';
import { assignIdentifierValue } from './utils';
import { Value, ValueType } from '../Value';
import { TokenType } from '../lex';
import { InternalError } from '../error';

// Note that the INPUT statement is quite complex and this
// statement does not implement it correctly yet.

export class InputStatement extends BaseStatement {
  constructor(channel, list) {
    super(StatementType.INPUT);
    this.channel = channel;
    this.list = list;
  }

  async exec(program, context) {
    if (this.channel !== undefined) {
      throw new InternalError(
        `Attempt to read from channel #${this.channel}: INPUT is only implemented for user input`
      );
    }

    for (const q of this.list) {
      if (q.str) {
        context.support.print(this.channel, q.str, false);

        // I have not found any reference that confirms this,
        // but from reading the Stuga source code it seems like
        // the BASIC interpreter used back then skipped the
        // question mark if an underscore was used to separate
        // the prompt string and variable name.
        if (q.separator !== TokenType.UNDERSCORE) {
          context.support.print(this.channel, '? ', false);
        }
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
