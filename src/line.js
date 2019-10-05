import { evaluateStatement } from './evaluate';

export class Line {
  constructor(source, sourceLineNo) {
    this.source = source;
    this.sourceLineNo = sourceLineNo;
    this.num = undefined;
    this.statements = [];
  }

  async exec(program, context) {
    for (const stmt of this.statements) {
      const next = await evaluateStatement(stmt, program, context);

      // If next is undefined, the program should either
      // go to another line or end execution. In either case
      // the remaining statements of the line will not get
      // executed.
      if (next !== undefined) {
        return next;
      }
    }

    return undefined;
  }
}
