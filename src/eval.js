import { RuntimeError } from './evaluate';

export const evaluate = async (program, context) => {
  while (true) {
    const line = program.lines[context.pc];
    const nextLine = await line.exec(program, context);

    if (nextLine === undefined) {
      context.pc = context.pc + 1;
      if (context.pc >= program.lines.length) {
        break;
      }
    } else {
      lineIndex = program.lineNumberToIndex(nextLine);
      if (lineIndex === undefined) {
        throw new RuntimeError(`Undefined line: ${next}`);
      }
      context.pc = lineIndex;
    }
  }
};
