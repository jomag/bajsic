import { popKeyword, popType } from './utils';
import { parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';
import { Statement, StatementType } from './';

export const parsePrint = tokens => {
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
