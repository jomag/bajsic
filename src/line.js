import { TokenType, LexicalError, tokenize } from './lex';
import { SyntaxError, parseStatements } from './parser';
import { evaluateStatement } from './evaluate';

export class Line {
  constructor(source, sourceLineNo) {
    this.source = source;
    this.sourceLineNo = sourceLineNo;
    this.num = undefined;
    this.statements = [];
  }

  static parse(source, sourceLineNo) {
    const line = new Line(source, sourceLineNo);

    // Lexical analyze
    let tokens;
    try {
      tokens = tokenize(source, sourceLineNo);
    } catch (e) {
      if (e instanceof LexicalError) {
        e.code = source;
        e.line = sourceLineNo;
      }
      throw e;
    }

    // Handle initial line number token
    if (tokens.length > 0 && tokens[0].type === TokenType.INT) {
      line.num = tokens[0].value;
      tokens.shift();
    }

    try {
      line.statements = parseStatements(tokens);
    } catch (e) {
      if (e instanceof SyntaxError) {
        e.code = source;
        e.lineNumber = sourceLineNo;
      }
      throw e;
    }

    return line;
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
  }
}
