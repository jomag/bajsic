import { StatementType } from './statement';
import { Keyword } from './lex';
import { evaluate } from './eval';

export class RuntimeError extends Error {
  constructor(message, context, program, ...params) {
    super(...params);
    this.message = message;
    this.setContext(context, program);
  }

  setContext(context, program) {
    this.context = context;
    if (context && program) {
      this.line = program.lines[context.pc];
    }
    this.program = program;
  }
}

const termPrintln = (value, context) => {
  context.stdout.write(value.toString());
  context.stdout.write('\n');
};

const evalList = (statement, program, context) => {
  if (statement.ranges.length === 0) {
    program.lines.forEach(line =>
      context.outputStream.write(`${line.source}\n`)
    );
  } else {
    for (const range of statement.ranges) {
      const lines = program.getRange(range[0], range[1]);
      lines.forEach(line => context.outputStream.write(`${line.source}\n`));
    }
  }
};

const evalPrint = async (statement, program, context) => {
  // FIXME: handle different output channels
  for (const outp of statement.list) {
    const result = await outp[0].evaluate(program, context);
    outp[1]
      ? context.outputStream.write(`${result.value}\n`)
      : context.outputStream.write(`${result.value}`);
  }
};

const evalRun = async (statement, program, context) => {
  await evaluate(program, context);
  /*
  while (true) {
    const line = program.lines[context.pc];
    const next = await line.exec(program, context);

    if (next === null) {
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
  */
};

const evalMap = {
  [StatementType.LIST]: evalList,
  [StatementType.PRINT]: evalPrint,
  [StatementType.RUN]: evalRun
};

export const evaluateStatement = async (statement, program, context) => {
  if (statement.exec) {
    return await statement.exec(program, context);
  }

  if (evalMap[statement.type]) {
    return await evalMap[statement.type](statement, program, context);
  }

  throw new Error(
    `Evaluation of statement type '${statement.type}' is not implemented`
  );
};
