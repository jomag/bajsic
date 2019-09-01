export const StatementType = {
  IF: 'if',
  DIM: 'dim',
  EMPTY: 'empty',
  GOSUB: 'gosub',
  LIST: 'list',
  PRINT: 'print',
  REMARK: 'remark',
  RETURN: 'return',
  GOTO: 'goto',
  END: 'end',
  RUN: 'run',
  ON_GOTO: 'onGoto',
  ON_GOSUB: 'onGosub',
  FOR: 'for',
  INPUT: 'input',
  CLOSE: 'close',
  OPEN: 'open',
  MARGIN: 'margin',
  QUOTE: 'quote',
  STOP: 'stop',
  READ: 'read',
  DATA: 'data',
  DEF: 'def',
  CHANGE: 'change',
  DEBUG: 'debug',
  LET: 'let',
  NEXT: 'next',
  RESUME: 'resume'
};

export class BaseStatement {
  constructor(type) {
    if (!type) {
      throw new Error(
        `Internal error: BaseStatement initialized with invalid type: ${type}`
      );
    }

    this.type = type;
  }
}

export class PrintStatement extends BaseStatement {
  constructor(channel, list) {
    super(StatementType.PRINT);
    this.channel = channel;
    this.list = list;
  }
}

export class GotoStatement extends BaseStatement {
  constructor(destination) {
    super(StatementType.GOTO);
    this.destination = destination;
  }

  exec(program, context) {
    return this.destination;
  }
}

export class RunStatement extends BaseStatement {
  constructor() {
    super(StatementType.RUN);
  }
}

export class RemarkStatement extends BaseStatement {
  constructor() {
    super(StatementType.REMARK);
  }

  exec(program, context) {}
}

export class ListStatement extends BaseStatement {
  constructor(ranges) {
    super(StatementType.LIST);
    this.ranges = ranges;
  }
}
