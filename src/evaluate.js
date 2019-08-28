import { StatementType } from './statement';
import { Keyword } from './lex';

export class RuntimeError extends Error {
  constructor(message, ...params) {
    super(...params);
    this.message = message;
  }
}

const termPrint = (value, context) => {
  context.stdout.write(value.toString());
};

const termPrintln = (value, context) => {
  context.stdout.write(value.toString());
  context.stdout.write('\n');
};

const evalList = (statement, program, context) => {
  if (statement.ranges.length === 0) {
    program.lines.forEach(line => termPrintln(line.source, context));
  } else {
    for (const range of statement.ranges) {
      const lines = program.getRange(range[0], range[1]);
      lines.forEach(line => termPrintln(line.source, context));
    }
  }
};

const evalPrint = (statement, program, context) => {
  // FIXME: handle different output channels
  for (const outp of statement.list) {
    const result = outp[0].evaluate(context);
    outp[1]
      ? termPrintln(result.value, context)
      : termPrint(result.value, context);
  }
};

const evalEnd = (statement, program, context) => {
  switch (statement.blockType) {
    case null:
    case Keyword.PROGRAM:
      return false;
    default:
      throw new SyntaxError(
        `Unsupported end of block type: ${statement.blockType}`
      );
  }
};

const evalRun = (statement, program, context) => {
  while (true) {
    const line = program.lines[context.pc];
    const next = line.exec(program, context);

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
};

const evalMap = {
  [StatementType.LIST]: evalList,
  [StatementType.PRINT]: evalPrint,
  [StatementType.RUN]: evalRun,
  [StatementType.END]: evalEnd
};

export const evaluate = (statement, program, context) => {
  if (statement.exec) {
    return statement.exec(program, context);
  }

  if (evalMap[statement.type]) {
    return evalMap[statement.type](statement, program, context);
  }

  throw new Error(
    `Evaluation of statement type '${statement.type}' is not implemented`
  );
};
