import { TokenType, Keyword } from '../lex';
import { parseExpression } from './expression';
import { parsePrint } from './parsePrint';
import { parseList } from './parseList';

export { parseExpression } from './expression';

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

const isOperand = tok =>
  tok.type === TokenType.IDENTIFIER ||
  tok.type === TokenType.INT ||
  tok.type === TokenType.FLOAT ||
  tok.type === TokenType.STRING;

const isOperator = tok => tok.type === TokenType.LT;
const isKeyword = (tok, keyword) =>
  tok.type === TokenType.KEYWORD && tok.value === keyword;

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

export class Statement {
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
