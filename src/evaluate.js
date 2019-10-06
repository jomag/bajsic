import { StatementType } from './statement';
import { evaluate } from './eval';

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
    // console.log(JSON.stringify(outp, null, 2));
    const result = await outp[0].evaluate(program, context);
    context.outputStream.write(
      outp[1] ? `${result.value}\n` : `${result.value}`
    );
  }
};

const evalRun = async (statement, program, context) => {
  context.prepare(program);
  await evaluate(program, context);
};

const evalMap = {
  [StatementType.LIST]: evalList,
  [StatementType.PRINT]: evalPrint,
  [StatementType.RUN]: evalRun,
};

export const evaluateStatement = async (statement, program, context) => {
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
