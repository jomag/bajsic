import { TokenType, Keyword } from '../lex';

export const StatementType = {
  DIM: 'dim',
  EMPTY: 'empty',
  GOSUB: 'gosub',
  LIST: 'list',
  PRINT: 'print',
  REMARK: 'remark',
  RETURN: 'return',
  GOTO: 'goto',
  END: 'end',
  RUN: 'run'
};

const expectLineLength = (tokens, length) => {
  if (tokens.length > length) {
    throw new SyntaxError(
      `Expected end of line. Got token ${tokens[length].type}`
    );
  }
};

const expectToken = (tok, type) => {
  const v = Array.isArray(type) ? type : [type];
  if (!v.includes(tok.type)) {
    throw new SyntaxError(
      `Expected token of type ${v.join(' or ')}, got "${tok.type}"`
    );
  }
};

const popType = (tokens, type) => {
  const tok = tokens.shift();

  if (!tok) {
    const exp = (Array.isArray(type) ? type : [type]).join(' or ');
    throw new SyntaxError(`Expected ${exp} at end of line`);
  }

  expectToken(tok, type);
  return tok;
};

const expectKeyword = (tok, keyword) => {
  const kws = Array.isArray(keyword) ? keyword : [keyword];

  if (tok.type !== TokenType.KEYWORD) {
    throw new SyntaxError(`Expected ${kws.join(' or ')}, got "${tok.type}"`);
  }

  if (!kws.includes(tok.value)) {
    throw new SyntaxError(`Expected ${kws.join(' or ')}, got ${tok.value}`);
  }
};

const popKeyword = (tokens, keyword) => {
  const kws = Array.isArray(keyword) ? keyword : [keyword];
  const tok = tokens.shift();

  if (!tok) {
    throw new SyntaxError(`Expected ${kws.join(' or ')} at end of line`);
  }

  expectKeyword(tok, keyword);
  return tok;
};

const expectIdentifier = tok => {
  if (tok.type !== TokenType.IDENTIFIER) {
    throw new SyntaxError(`Expected identifier, got ${tok.type}`);
  }
};

export class SyntaxError extends Error {
  constructor(message, ...params) {
    super(...params);
    this.message = message;
  }
}

const parseDim = tokens => {
  // VAX BASIC Ref: page 244
  // Format: DIM [data-type] name()
  // Format: LIST, LIST n, LIST n-m, LIST n,n-m,...

  const arrays = {};
  let i = 1;
  while (i < tokens.length) {
    if (i > 1) {
      expectToken(tokens[i], TokenType.COMMA);
      i++;
    }

    expectToken(tokens[i], TokenType.IDENTIFIER);
    const name = tokens[i].value;
    i++;

    expectToken(tokens[i], TokenType.LPAR);
    i++;

    const dim = [];

    while (true) {
      expectToken(tokens[i], TokenType.INT);
      dim.push(tokens[i].value);
      i++;

      if (tokens[i].type === TokenType.RPAR) {
        i++;
        break;
      }

      expectToken(tokens[i], TokenType.COMMA);
      i++;
    }

    arrays[name] = dim;
  }

  return new Statement(StatementType.DIM, arrays);
};

const parseGoto = tokens => {
  popKeyword(tokens, Keyword.GOTO);
  const dest = popType(tokens, TokenType.INT);
  return new Statement(StatementType.GOTO, dest.value);
};

const parseList = tokens => {
  // VAX BASIC Ref: page 109
  // Format: LIST, LIST n, LIST n-m, LIST n,n-m,...
  popKeyword(tokens, Keyword.LIST);
  let ranges = [];

  if (tokens.length) {
    let from = null;
    let to = null;
    let expectRange = false;

    const append = () => {
      if (expectRange) {
        if (from === null || to === null) {
          throw new SyntaxError('Incomplete range');
        }
        ranges.push([from, to]);
      } else {
        if (from === null) {
          new SyntaxError('Missing line number');
        }
        ranges.push([from, from]);
      }

      expectRange = false;
      from = null;
      to = null;
    };

    while (tokens.length) {
      const tok = tokens.shift();

      switch (tok.type) {
        case TokenType.INT:
          if (expectRange) {
            to = tok.value;
          } else {
            if (from !== null) {
              throw new SyntaxError('Invalid range');
            }
            from = tok.value;
          }
          break;

        case TokenType.COMMA:
          append();
          break;

        case TokenType.MINUS:
          if (from === null) {
            throw new SyntaxError('Negative line number is not allowed');
          }
          expectRange = true;
          break;

        default:
          throw new SyntaxError('Invalid tokens in list range');
      }
    }

    append();
  }
  return new Statement(StatementType.LIST, ranges);
};

const isOperand = tok =>
  tok.type === TokenType.IDENTIFIER ||
  tok.type === TokenType.INT ||
  tok.type === TokenType.FLOAT ||
  tok.type === TokenType.STRING;

const isOperator = tok => tok.type === TokenType.LT;
const isKeyword = (tok, keyword) =>
  tok.type === TokenType.KEYWORD && tok.value === keyword;

class Expression {}

export const parseExpression = tokens => {
  // FIXME: very simplified expression parser!
  const expr = [];

  while (tokens.length > 0) {
    const tok = tokens[0];

    if ([TokenType.COMMA, TokenType.SEMICOLON].includes(tok.type)) {
      return expr;
    }

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

const parsePrint = tokens => {
  // VAX BASIC Ref: page 462
  // Format: PRINT, PRINT expr, PRINT #channel, expr
  popKeyword(tokens, Keyword.PRINT);
  let channel = null;
  let list = [];

  if (tokens.length) {
    if (tokens[0].type === TokenType.HASH) {
      tokens.shift();
      channel = parseExpression(tokens);
      popType(tokens, TokenType.COMMA);
    }

    while (tokens.length) {
      const expr = parseExpression(tokens);
      let separator =
        tokens.length > 0 &&
        popType(tokens, [TokenType.COMMA, TokenType.SEMICOLON]);
      list.push([expr, !(separator && separator.type === TokenType.SEMICOLON)]);
    }
  }

  return new Statement(StatementType.PRINT, { channel, list });
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

const parseRun = tokens => {
  popKeyword(tokens, Keyword.RUN);
  if (tokens.length !== 0) {
    throw new SyntaxError('Expected end of line after run command');
  }
  return new Statement(StatementType.RUN);
};

const parseEnd = tokens => {
  // VAX BASIC Ref: page 253
  // Format: END, END PROGRAM, END IF, ...
  popKeyword(tokens, Keyword.END);

  const blockKeywords = [Keyword.PROGRAM];

  let blockType = null;

  if (tokens.length > 0) {
    const tok = popKeyword(tokens, blockKeywords);
    blockType = tok.value;
  }

  return new Statement(StatementType.END, blockType);
};

class Statement {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

// Parse statement from tokens
//
// This function will mutate the tokens array by
// removing used tokens from it. The function can
// then be called again with the remaining tokens.
export const parse = tokens => {
  const tok = tokens[0];

  switch (tok.type) {
    case TokenType.REMARK:
      while (tokens.length) {
        tokens.pop();
      }
      return new Statement(StatementType.REMARK);

    case TokenType.KEYWORD:
      switch (tok.value) {
        case Keyword.DIM:
          return parseDim(tokens);
        case Keyword.GOTO:
          return parseGoto(tokens);
        case Keyword.IF:
          return parseIf(tokens);
        case Keyword.PRINT:
          return parsePrint(tokens);
        case Keyword.RETURN:
          return parseReturn(tokens);
        case Keyword.GOSUB:
          return parseGosub(tokens);
        case Keyword.LIST:
          return parseList(tokens);
        case Keyword.RUN:
          return parseRun(tokens);
        case Keyword.END:
          return parseEnd(tokens);
        default:
          throw new SyntaxError(`Unsupported statement keyword: ${tok.value}`);
      }

    case TokenType.IDENTIFIER:
      return parseAssignment(tokens);

    default:
      throw new SyntaxError(
        `Illegal syntax. First token is "${tok.type}" with value "${tok.value}"`
      );
  }
};
