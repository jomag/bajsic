import {
  popIdentifier,
  popKeyword,
  popOptionalKeyword,
  popType
} from './utils';
import { Keyword, TokenType } from '../lex';
import { parseExpression } from './expression';
import { ForStatement } from '../statements/forStatement';

// Format:
//
// Unconditional:
//
//   FOR var = expr1 TO expr2 [STEP expr3]
//
// Conditional:
//
//   FOR var = expr1 to expr2 [STEP expr3] UNTIL expr4
//   FOR var = expr1 to expr2 [STEP expr3] WHILE expr4

export const parseForStatement = tokens => {
  popKeyword(tokens, Keyword.FOR);
  const name = popIdentifier(tokens);
  popType(tokens, TokenType.EQ);
  const start = parseExpression(tokens);
  popKeyword(tokens, Keyword.TO);
  const final = parseExpression(tokens);
  const step =
    popOptionalKeyword(tokens, Keyword.STEP) && parseExpression(tokens);
  const untilCond =
    popOptionalKeyword(tokens, Keyword.UNTIL) && parseExpression(tokens);
  const whileCond =
    popOptionalKeyword(tokens, Keyword.WHILE) && parseExpression(tokens);

  return new ForStatement(name, start, final, step, untilCond, whileCond);
};
