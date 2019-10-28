// A few details about how values are formatted:
//
// Grouping:
//
// Values separated by comma (PRINT 1, 2, 3) should be grouped into
// columns of 14 characters:
//
// PRINT "ABC", "DEF", "GHI"  =>  'ABC           DEF           GHI'
//
// If one value spans more than 14 characters, the following values are
// moved further so that they start on a column evenly divisible by 14.
//
// Values separated by semicolon are not separated by any whitespace:
//
// PRINT "ABC", "DEF", "GHI" => "ABCDEFGHI"
//
// Linebreaks:
//
// A linebreak is always inserted at the end of the print statement unless
// the statement ends with a semicolon or comma.
//
// Numbers:
//
// Numbers are either preceded with a minus sign or space character, depending
// on if it's a negative or positive value. They are superseded by a space character.
//
// PRINT 1; -1; 123;"Done"  =>  ' 1 -1  123 Done'

import { BaseStatement, StatementType } from '../statement';
import { TokenType } from '../lex';

const GROUP_SIZE = 14;

export class PrintStatement extends BaseStatement {
  constructor(channel, list) {
    super(StatementType.PRINT);
    this.channel = channel;
    this.list = list;
  }

  async exec(program, context) {
    const channel = (this.channel && this.channel.value) || 0;
    let str = '';

    const format = value => {
      if (value.isNumeric()) {
        const n = value.value;
        return n < 0 ? `${n} ` : ` ${n} `;
      }

      return value.value;
    };

    for (let i = 0; i < this.list.length; i++) {
      const outp = this.list[i];
      const last = i === this.list.length - 1;
      const result = await outp[0].evaluate(program, context);
      str += format(result);

      if (outp[1] === TokenType.COMMA) {
        str += ' '.repeat(GROUP_SIZE - (str.length % GROUP_SIZE));
      }

      if (last && !outp[1]) {
        str += '\n';
      }
    }

    context.support.print(channel, str);
  }
}
