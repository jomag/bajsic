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
  RESUME: 'resume',

  BRANCH: 'branch',
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
