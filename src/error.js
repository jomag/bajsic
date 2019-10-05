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

export class InternalError extends Error {
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

export class OutOfDataError extends RuntimeError {
  constructor(context, program) {
    super('Out Of Data Error');
    this.setContext(context, program);
  }
}
