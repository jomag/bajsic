import { StatementType } from './parse';

class RuntimeError extends Error {
  constructor(message, ...params) {
    super(...params);
    this.message = message;
  }
}

const termPrint = (value) => {
  process.stdout.write(value.toString());
}

const termPrintln = (value) => {
  process.stdout.write(value.toString());
  process.stdout.write('\n');
}

const evalExpr = (expr, program, context) => {
  if (expr.length !== 1) {
    throw new Error("FIXME: only single operand expressions supported");
  }
  return expr[0].value;
}

const evalGoto = (statement, program, context) => {
  const lineNum  = statement.data;
  const lineIndex = program.lineNumberToIndex(lineNum);
  if (!lineIndex) {
    throw new RuntimeError(`Undefined line number: ${lineNum}`);
  }
  context.pc = lineIndex;
}

const evalList = (statement, program, context) => {
  if (statement.data.length === 0) {
    program.lines.forEach(line => console.log(line.source));
  } else {
    for (const range of statement.data) {
      const lines = program.getRange(range[0], range[1]);
      lines.forEach(line => console.log(line.source));
    }
  }
};

const evalPrint = (statement, program, context) => {
  // FIXME: handle different output channels
  for (const outp of statement.data.list) {
    const value = evalExpr(outp[0], program, context);
    outp[1] ? termPrintln(value) : termPrint(value);
  }
};

const evalRun = (statement, program, context) => {
  while (true) {
    const line = program.lines[context.pc];
    line.exec(program, context);
  }
}

const evalMap = {
  [StatementType.LIST]: evalList,
  [StatementType.PRINT]: evalPrint,
  [StatementType.GOTO]: evalGoto,
  [StatementType.RUN]: evalRun
};

export const evaluate = (statement, program, context) =>
  evalMap[statement.type](statement, program, context);
