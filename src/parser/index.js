import { TokenType, Keyword } from '../lex';
import {
  DimStatement,
  IfStatement,
  GosubStatement,
  GotoStatement,
  RemarkStatement,
  ReturnStatement,
  LetStatement
} from '../statement';
import { parseExpression } from './expression';
import { parsePrint } from './parsePrint';
import { parseList } from './parseList';
import { parseOnStatement } from './parseOnStatement';
import { popKeyword, popType, popOptionalKeyword } from './utils';
import { parseForStatement } from './parseForStatement';

export { parseExpression } from './expression';

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
  let first = true;
  let i = 1;

  popKeyword(tokens, Keyword.DIM);

  while (i < tokens.length) {
    const nameToken = popType(tokens, TokenType.IDENTIFIER);
    const name = nameToken.value;

    popType(tokens, TokenType.LPAR);
    const dim = [];

    while (true) {
      // FIXME: does not handle non-zero based dimensions like DIM A(10 TO 20)
      const lenToken = popType(tokens, TokenType.INT);
      const len = lenToken.value;
      dim.push(len);

      const nextToken = popType(tokens, [TokenType.COMMA, TokenType.RPAR]);

      if (nextToken.type === TokenType.RPAR) {
        break;
      }
    }

    arrays[name] = dim;

    if (tokens.length) {
      popType(tokens, TokenType.COMMA);
    } else {
      break;
    }
  }

  return new DimStatement(arrays);
};

const parseGoto = tokens => {
  popKeyword(tokens, Keyword.GOTO);
  const dest = popType(tokens, TokenType.INT);
  return new GotoStatement(dest.value);
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
  popKeyword(tokens, Keyword.IF);
  const condition = parseExpression(tokens);
  popKeyword(tokens, Keyword.THEN);

  const thenStatements = [];
  const elseStatements = [];

  // Handle special case with a number following the THEN keyword.
  // It should be handled as a GOTO:
  // `IF cond THEN 724` is equal to `IF cond THEN GOTO 724`
  if (tokens.length) {
    if (tokens[0].type === TokenType.INT) {
      const line = tokens.shift();
      thenStatements.push(new GotoStatement(line.value));
    } else {
      // FIXME: handle multiple statements
      thenStatements.push(parseStatement(tokens));
    }
  }

  if (tokens.length && isKeyword(tokens[0], Keyword.ELSE)) {
    popKeyword(tokens, Keyword.ELSE);
    if (tokens.length && tokens[0].type === TokenType.INT) {
      const line = tokens.shift();
      elseStatements.push(new GotoStatement(line.value));
    } else {
      // FIXME: handle more than one statement
      elseStatements.push(parseStatement(tokens));
    }
  }

  return new IfStatement(condition, thenStatements, elseStatements);
};

const parseLet = tokens => {
  let identifier = tokens[0];

  // The 'LET' prefix is optional
  if (identifier.type !== TokenType.IDENTIFIER) {
    popKeyword(tokens, Keyword.LET);
    identifier = popType(tokens, TokenType.IDENTIFIER);
  } else {
    tokens.shift();
  }

  const tok = popType(tokens, [TokenType.EQ, TokenType.LPAR]);
  const index = [];

  if (tok.type === TokenType.LPAR) {
    while (true) {
      index.push(parseExpression(tokens));
      const tok = popType(tokens, [TokenType.COMMA, TokenType.RPAR]);
      if (tok.type === TokenType.RPAR) {
        break;
      }
    }

    popType(tokens, TokenType.EQ);
  }

  const expr = parseExpression(tokens);

  return new LetStatement(identifier, index, expr);
};

const parseReturn = (tokens, line) => {
  popKeyword(tokens, Keyword.RETURN);
  return new ReturnStatement();
};

const parseGosub = (tokens, line) => {
  popKeyword(tokens, Keyword.GOSUB);
  const dest = popType(tokens, TokenType.INT);
  return new GosubStatement(dest.value);
};

const parseRun = tokens => {
  popKeyword(tokens, Keyword.RUN);
  if (tokens.length !== 0) {
    throw new SyntaxError('Expected end of line after run command');
  }
  return new RunStatement();
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

  return new EndStatement(blockType);
};

// Parse statement from tokens
//
// This function will mutate the tokens array by
// removing used tokens from it. The function can
// then be called again with the remaining tokens.
export const parseStatement = tokens => {
  const parsePrimaryStatement = () => {
    const tok = tokens[0];

    switch (tok.type) {
      case TokenType.REMARK:
        while (tokens.pop());
        return new RemarkStatement();

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
          case Keyword.LET:
            return parseLet(tokens);
          case Keyword.ON:
            return parseOnStatement(tokens);
          default:
            throw new SyntaxError(
              `Unsupported statement keyword: ${tok.value}`
            );
        }

      case TokenType.IDENTIFIER:
        return parseLet(tokens);

      default:
        throw new SyntaxError(
          `Illegal syntax. First token is "${tok.type}" with value "${
            tok.value
          }"`
        );
    }
  };

  let statement = parsePrimaryStatement();
  let modifier = popOptionalKeyword(tokens, [Keyword.IF, Keyword.FOR]);

  while (modifier) {
    if (modifier.value === Keyword.IF) {
      const condition = parseExpression(tokens);
      statement = new IfStatement(condition, [statement], []);
    }

    if (modifier.value === Keyword.FOR) {
      // The FOR statement parser can be reused for this
      // statement modifier, but we need to reinsert the
      // FOR keyword at start of token list.
      tokens.unshift(modifier);
      const forStmt = parseForStatement(tokens);
      forStmt.statement = statement;
      statement = forStmt;
    }

    modifier = popOptionalKeyword(tokens, [Keyword.IF, Keyword.FOR]);
  }

  return statement;
};

export const parseStatements = tokens => {
  const statements = [];

  while (tokens.length > 0) {
    const statement = parseStatement(tokens);
    statements.push(statement);

    if (tokens.length > 0 && tokens[0].type === TokenType.SEPARATOR) {
      tokens.shift();
    }
  }

  return statements;
};
