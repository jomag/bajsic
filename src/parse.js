import { TokenType, Keyword } from "./lex";

const StatementType = {
  REMARK: "remark",
  DIM: "dim"
};

const expectToken = (tok, type, line) => {
  if (tok.type !== type) {
    throw new SyntaxError(
      `Expected token of type "${type}", got "${tok.type}"`,
      line.lineNumber,
      line.line
    );
  }
};

export class SyntaxError extends Error {
  constructor(message, line, code, ...params) {
    super(...params);
    this.message = message;
    this.line = line;
    this.code = code;
  }
}

const parseDim = (tokens, line) => {
  const arrays = {};
  let i = 1;
  while (i < tokens.length) {
    if (i > 1) {
      expectToken(tokens[i], TokenType.COMMA, line);
      i++;
    }

    expectToken(tokens[i], TokenType.IDENTIFIER, line);
    const name = tokens[i].value;
    i++;

    expectToken(tokens[i], TokenType.LPAR, line);
    i++;

    const dim = [];

    while (true) {
      expectToken(tokens[i], TokenType.INT, line);
      dim.push(tokens[i].value);
      i++;

      if (tokens[i].type === TokenType.RPAR) {
        i++;
        break;
      }

      expectToken(tokens[i], TokenType.COMMA, line);
      i++;
    }

    arrays[name] = dim;
  }

  return {
    line: line.lineNumber,
    type: StatementType.DIM,
    arrays
  };
};

const parseGoto = (tokens, line) => {
  expectToken(tokens[1], TokenType.INT, line);
  return {
    line: line.lineNumber,
    type: StatementType.GOTO,
    destination: tokens[1].value
  };
};

export function parse(tokenizedLines) {
  const statements = [];

  tokenizedLines.forEach(line => {
    const tokens = line.tokens;

    // Handle line number
    if (!tokens[0] || tokens[0].type !== TokenType.INT) {
      throw new SyntaxError(
        `Line does not start with line number`,
        line.lineNumber,
        line.line
      );
    }

    // The annotated line number
    const lineNumber = tokens[0].value;

    switch (tokens[1].type) {
      case TokenType.REMARK:
        return {
          lineNumber,
          type: StatementType.REMARK,
          value: tokens[1].value
        };

      case TokenType.KEYWORD:
        switch (tokens[1].value) {
          case Keyword.DIM:
            return parseDim(tokens.splice(1), line);
          case Keyword.GOTO:
            return parseGoto(tokens.splice(1), line);
          default:
            throw new SyntaxError(
              `Unsupported statement keyword: ${tokens[1].value}`,
              line.lineNumber,
              line.line
            );
        }

      default:
        throw new SyntaxError(
          `Illegal syntax. First token is "${tokens[1].type}" with value "${
            tokens[1].value
          }"`,
          line.lineNumber,
          line.line
        );
    }
  });
}
