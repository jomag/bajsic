import { TokenType, Keyword, tokenize } from '../lex';
import { Program } from '../program';
import { Line } from '../line';
import { LexicalError } from '../error';

import { GotoStatement } from '../statements/GotoStatement';
import { RemarkStatement } from '../statements/RemarkStatement';
import { RunStatement } from '../statements/RunStatement';
import { DebugStatement } from '../statements/DebugStatement';
import { DimStatement } from '../statements/DimStatement';
import { EndStatement } from '../statements/EndStatement';
import { GosubStatement } from '../statements/GosubStatement';
import { IfStatement } from '../statements/ifStatement';
import { LetStatement } from '../statements/LetStatement';
import { ReturnStatement } from '../statements/ReturnStatement';

import { parseExpression } from './expression';
import { parseVar } from './parseVar';
import { parsePrint } from './parsePrint';
import { parseList } from './parseList';
import { parseOnStatement } from './parseOnStatement';
import { popKeyword, popType, popOptionalKeyword } from './utils';
import { parseForStatement } from './parseForStatement';
import { parseNextStatement } from './parseNextStatement';
import { parseInputStatement } from './parseInputStatement';
import { parseCloseStatement } from './parseCloseStatement';
import { parseOpenStatement } from './parseOpenStatement';
import { parseResumeStatement } from './parseResumeStatement';
import { parseMarginStatement } from './parseMarginStatement';
import { parseQuoteStatement } from './parseQuoteStatement';
import { parseStopStatement } from './parseStopStatement';
import { parseReadStatement } from './parseReadStatement';
import { parseDataStatement } from './parseDataStatement';
import { parseDefStatement } from './parseDefStatement';
import { parseChangeStatement } from './parseChangeStatement';
import { parseWriteStatement } from './parseWriteStatement';

// eslint-disable-next-line import/no-cycle
import { parseIfStatement } from './parseIfStatement';

export { parseExpression } from './expression';

const parseDim = tokens => {
  // VAX BASIC Ref: page 244
  // Format: DIM [data-type] name()
  // FIXME: does not handle types!

  const arrays = {};
  const i = 1;

  popKeyword(tokens, Keyword.DIM);

  // FIXME: need some cleanup. "i" is always 1.
  while (i < tokens.length) {
    const nameToken = popType(tokens, TokenType.IDENTIFIER);
    const name = nameToken.value;

    popType(tokens, TokenType.LPAR);
    const dim = [];

    for (;;) {
      // FIXME: does not handle non-zero based dimensions like DIM A(10 TO 20)
      const lenToken = popType(tokens, TokenType.INT);
      const len = lenToken.value;
      dim.push([0, len]);

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

const parseLet = tokens => {
  popOptionalKeyword(tokens, Keyword.LET);

  const identifier = parseVar(tokens);
  popType(tokens, TokenType.EQ);
  const expr = parseExpression(tokens);

  return new LetStatement(identifier, expr);
};

const parseReturn = tokens => {
  popKeyword(tokens, Keyword.RETURN);
  return new ReturnStatement();
};

const parseGosub = tokens => {
  popKeyword(tokens, Keyword.GOSUB);
  const dest = popType(tokens, TokenType.INT);
  return new GosubStatement(dest.value);
};

const parseRun = tokens => {
  popKeyword(tokens, Keyword.RUN);
  return new RunStatement();
};

const parseDebugStatement = tokens => {
  popKeyword(tokens, Keyword.DEBUG);
  return new DebugStatement();
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

const parseFnEnd = tokens => {
  // VAX BASIC Ref: page 245, 4-85
  // Alias for END FUNCTION
  popKeyword(tokens, Keyword.FNEND);
  return new EndStatement(Keyword.FUNCTION);
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
            return parseIfStatement(tokens);
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
          case Keyword.FOR:
            return parseForStatement(tokens);
          case Keyword.NEXT:
            return parseNextStatement(tokens);
          case Keyword.INPUT:
            return parseInputStatement(tokens);
          case Keyword.OPEN:
            return parseOpenStatement(tokens);
          case Keyword.CLOSE:
            return parseCloseStatement(tokens);
          case Keyword.RESUME:
            return parseResumeStatement(tokens);
          case Keyword.MARGIN:
            return parseMarginStatement(tokens);
          case Keyword.QUOTE:
            return parseQuoteStatement(tokens);
          case Keyword.STOP:
            return parseStopStatement(tokens);
          case Keyword.READ:
            return parseReadStatement(tokens);
          case Keyword.DATA:
            return parseDataStatement(tokens);
          case Keyword.DEF:
            return parseDefStatement(tokens);
          case Keyword.FNEND:
            return parseFnEnd(tokens);
          case Keyword.CHANGE:
            return parseChangeStatement(tokens);
          case Keyword.WRITE:
            return parseWriteStatement(tokens);
          case Keyword.DEBUG:
            return parseDebugStatement(tokens);
          default:
            throw new SyntaxError(
              `Unsupported statement keyword: ${tok.value}`
            );
        }

      case TokenType.IDENTIFIER:
        return parseLet(tokens);

      default:
        throw new SyntaxError(
          `Illegal syntax. First token is "${tok.type}" with value "${tok.value}"`
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

/**
 * @param {string} source
 * @param {number} sourceLineNo
 * @returns {Line}
 */
export const parseLine = source => {
  const line = new Line(source);

  // Lexical analyze
  let tokens;
  try {
    tokens = tokenize(source);
  } catch (e) {
    if (e instanceof LexicalError) {
      e.code = source;
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
    }
    throw e;
  }

  return line;
};

/**
 * @param {string} source
 * @returns {Program}
 */
export const parse = source => {
  const program = new Program();

  const lines = source.split('\n');

  for (const line of lines) {
    if (line.trim().length > 0) {
      program.add(parseLine(line));
    }
  }

  return program;
};
