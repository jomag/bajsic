import { popKeyword, popOptionalType } from './utils';
import { parseOptionalExpression, parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';
import { PrintStatement } from '../statements/PrintStatement';

export const parsePrint = tokens => {
  // VAX BASIC Ref: page 462
  // Format: PRINT, PRINT expr, PRINT #channel, expr
  popKeyword(tokens, Keyword.PRINT);
  let channel = null;
  const list = [];

  if (popOptionalType(tokens, TokenType.HASH)) {
    channel = parseExpression(tokens);
    if (!popOptionalType(tokens, TokenType.COMMA)) {
      return new PrintStatement(channel, []);
    }
  }

  while (tokens.length) {
    const expr = parseOptionalExpression(tokens);

    if (!expr) {
      break;
    }

    const delimiter = popOptionalType(tokens, [
      TokenType.SEMICOLON,
      TokenType.COMMA,
    ]);

    list.push([expr, delimiter && delimiter.type]);

    if (!delimiter) {
      break;
    }
  }

  return new PrintStatement(channel, list);
};
