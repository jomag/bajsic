export class LexicalError extends Error {
  constructor(message, column, ...params) {
    super(...params);
    this.message = message;
    this.column = column;
  }
}

export class SyntaxError extends Error {
  constructor(message, ...params) {
    super(...params);
    this.message = message;
  }
}

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
    super('Out Of Data Error', context, program);
  }
}

export class NextWithoutForError extends RuntimeError {
  constructor(context, program) {
    super('Next Without For Error', context, program);
  }
}

export class IllegalFunctionCallError extends RuntimeError {
  constructor(message, context, program) {
    super(`Illegal Function Call: ${message}`, context, program);
  }
}

export class TypeMismatchError extends RuntimeError {
  constructor(message, context, program) {
    super(`Type Mismatch: ${message}`, context, program);
  }
}
