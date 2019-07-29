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
  CHANGE: 'change'
};

export class BaseStatement {
  constructor(type) {
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

export class DimStatement extends BaseStatement {
  constructor(arrays) {
    super(StatementType.DIM);
    this.arrays = arrays;
  }
}

export class GotoStatement extends BaseStatement {
  constructor(destination) {
    super(StatementType.GOTO);
    this.destination = destination;
  }
}

export class GosubStatement extends BaseStatement {
  constructor(destination) {
    super(StatementType.GOSUB);
    this.destination = destination;
  }
}

export class LetStatement extends BaseStatement {
  constructor(identifier, expr) {
    super(StatementType.LET);
    this.identifier = identifier;
    this.expr = expr;
  }
}

export class ReturnStatement extends BaseStatement {
  constructor() {
    super(StatementType.RETURN);
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
}

export class ListStatement extends BaseStatement {
  constructor(ranges) {
    super(StatementType.LIST);
    this.ranges = ranges;
  }
}

class BaseOnStatement extends BaseStatement {
  constructor(type, expr, targets, otherwise) {
    super(type);
    this.expr = expr;
    this.targets = targets;
    this.otherwise = otherwise;
  }
}

export class OnGotoStatement extends BaseOnStatement {
  constructor(expr, targets, otherwise) {
    super(StatementType.ON_GOTO, expr, targets, otherwise);
  }
}

export class OnGosubStatement extends BaseOnStatement {
  constructor(expr, targets, otherwise) {
    super(StatementType.ON_GOSUB, expr, targets, otherwise);
  }
}
