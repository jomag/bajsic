import { BaseStatement, StatementType } from '../statement';
import { RuntimeError } from '../evaluate';
import { userInput } from '../cli';

const PROMPT = 'dbg> ';

export class DebugStatement extends BaseStatement {
  constructor() {
    super(StatementType.DEBUG);
  }

  async exec(program, context) {
    while (true) {
      const line = program.lines[context.pc];

      console.log('Variables:\n', context.variables, '\n');
      console.log('Next line:\n', line.source);

      const cmd = await userInput(PROMPT);
      const next = await line.exec(program, context);

      if (next === false) {
        break;
      }

      if (next !== undefined) {
        const lineIndex = program.lineNumberToIndex(next);
        if (lineIndex === undefined) {
          throw new RuntimeError(`Undefined line number: ${next}`);
        }
        context.pc = lineIndex;
      } else {
        context.pc = context.pc + 1;
        if (context.pc >= program.lines.length) {
          break;
        }
      }
    }
  }
}
