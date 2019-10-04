import { StatementType } from './statement';
import { Keyword } from './lex';
import { evaluate } from './eval';

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
  context.pc = 0;
  await evaluate(program, context);
};

const evalMap = {
  [StatementType.LIST]: evalList,
  [StatementType.PRINT]: evalPrint,
  [StatementType.RUN]: evalRun,
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
