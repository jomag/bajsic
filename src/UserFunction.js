import { evaluate } from './eval';
import { RuntimeError } from './error';

export class UserFunction {
  constructor(lineNumber) {
    this.lineNumber = lineNumber;
  }

  async call(args, program, context) {
    context.push(context.pc);
    context.scope();

    const defLineIndex = program.lineNumberToIndex(this.lineNumber);
    const defLine = program.lines[defLineIndex];

    if (defLine.statements.length !== 1) {
      throw new RuntimeError(
        `DEF FN is not single statement on line ${this.lineNumber}`,
        context,
        program
      );
    }

    const defStatement = defLine.statements[0];
    const name = defStatement.name.toUpperCase();

    let n = 0;
    for (const arg of defStatement.args) {
      context.assignVariable(arg.name, args[n]);
      n += 1;
    }

    // eslint-disable-next-line no-param-reassign
    context.pc = program.lineNumberToIndex(this.lineNumber) + 1;
    await evaluate(program, context);

    // eslint-disable-next-line no-param-reassign
    context.pc = context.pop();
    const scope = context.descope();

    return scope.variables[name];
  }
}
