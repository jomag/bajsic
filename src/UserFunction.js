import { evaluate } from './eval';

export class UserFunction {
  constructor(lineNumber) {
    this.lineNumber = lineNumber;
  }

  async call(args, program, context) {
    context.push(context.pc + 1);
    context.scope();

    const address = program.labels[this.lineNumber];
    const defStatement = program.statements[address];
    const name = defStatement.name.toUpperCase();

    let n = 0;
    for (const arg of defStatement.args) {
      context.assignVariable(arg.name, args[n]);
      n += 1;
    }

    // eslint-disable-next-line no-param-reassign
    context.pc = address + 1;
    await evaluate(program, context);

    // eslint-disable-next-line no-param-reassign
    context.pc = context.pop();
    const scope = context.descope();

    return scope.variables[name];
  }
}
