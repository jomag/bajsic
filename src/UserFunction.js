class UserFunction {
  constructor(lineNumber) {
    this.lineNumber = lineNumber;
  }

  call(args, context) {
    context.push(context.pc);
  }
}
