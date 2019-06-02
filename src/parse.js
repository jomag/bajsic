import { TokenType, Keyword } from "./lex";

const StatementType = {
  REMARK: "remark",
  DIM: "dim",
  PRINT: "print",
  RETURN: "return",
  GOSUB: "gosub"
};

const expectLineLength = (tokens, length, line) => {
  if (tokens.length > length) {
    throw new SyntaxError(
      `Expected end of line. Got token ${tokens[length].type}`,
      line.lineNumber,
      line.line
    );
  }
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

const expectKeyword = (tok, keyword) => {
  if (tok.type !== TokenType.KEYWORD || tok.value !== keyword) {
    throw new SyntaxError(`Expected "${keyword}", got "${tok.type}"`);
  }
};

const expectIdentifier = tok => {
  if (tok.type !== TokenType.IDENTIFIER) {
    throw new SyntaxError(`Expected identifier, got ${tok.type}`);
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

  expectLineLength(tokens, 2, line);
  return {
    line: line.lineNumber,
    type: StatementType.GOTO,
    destination: tokens[1].value
  };
};

const isOperand = tok =>
  tok.type === TokenType.IDENTIFIER ||
  tok.type === TokenType.INT ||
  tok.type === TokenType.FLOAT ||
  tok.type === TokenType.STRING;

const isOperator = tok => tok.type === TokenType.LT;
const isKeyword = (tok, keyword) =>
  tok.type === TokenType.KEYWORD && tok.value === keyword;

const parseExpression = tokens => {
  // FIXME: very simplified expression parser!
  const expr = [];

  while (tokens.length > 0) {
    const tok = tokens[0];

    if (isKeyword(tok, Keyword.THEN) || isKeyword(tok, Keyword.ELSE)) {
      return expr;
    }

    expr.push(tokens.shift());
  }

  return expr;
};

const parseIf = (tokens, line) => {
  let tok = tokens.shift();
  expectKeyword(tok, Keyword.IF);

  const statement = {
    line: line.lineNumber,
    type: StatementType.IF,
    condition: [],
    thenBlock: [],
    elseBlock: []
  };

  statement.condition = parseExpression(tokens);

  tok = tokens.shift();
  expectKeyword(tok, Keyword.THEN);
};

const parsePrint = (tokens, line) => {
  expectKeyword(tokens.shift(), Keyword.PRINT);

  return {
    line: line.lineNumber,
    type: StatementType.PRINT,
    expr: parseExpression(tokens)
  };
};

const parseReturn = (tokens, line) => {
  expectKeyword(tokens.shift(), Keyword.RETURN);
  return {
    line: line.lineNumber,
    type: StatementType.RETURN
  };
};

const parseGosub = (tokens, line) => {
  expectKeyword(tokens.shift(), Keyword.GOSUB);
};

const parseAssignment = (tokens, line) => {
  expectIdentifier(tokens.shift());
};

export const parseLine = line => {
  const tokens = line.tokens;

  // Handle line number
  let tok = tokens.shift();
  if (!tok || tok.type !== TokenType.INT) {
    throw new SyntaxError(
      `Line does not start with line number`,
      line.lineNumber,
      line.original
    );
  }

  // The annotated line number
  const lineNumber = tok.value;

  // Check the token after the line number token to determine statement type
  tok = tokens[0];

  try {
    switch (tok.type) {
      case TokenType.REMARK:
        return {
          lineNumber,
          type: StatementType.REMARK,
          value: tok.value
        };

      case TokenType.KEYWORD:
        switch (tok.value) {
          case Keyword.DIM:
            return parseDim(tokens, line);
          case Keyword.GOTO:
            return parseGoto(tokens, line);
          case Keyword.IF:
            return parseIf(tokens, line);
          case Keyword.PRINT:
            return parsePrint(tokens, line);
          case Keyword.RETURN:
            return parseReturn(tokens, line);
          case Keyword.GOSUB:
            return parseGosub(tokens, line);
          default:
            throw new SyntaxError(
              `Unsupported statement keyword: ${tok.value}`
            );
        }

      case TokenType.IDENTIFIER:
        return parseAssignment(tokens, line);

      default:
        throw new SyntaxError(
          `Illegal syntax. First token is "${tok.type}" with value "${
            tok.value
          }"`
        );
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      // Enrich the error with line number and original code
      e.lineNumber = tok.lineNumber;
      e.code = line.original;
    }
    throw e;
  }
};

export function parse(tokenizedLines) {
  return tokenizedLines.map(line => {
    const stmt = parseLine(line);
    console.log(line.original);
    console.log(stmt);
  });
}
