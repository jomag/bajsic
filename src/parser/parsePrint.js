import { popKeyword, popType, popOptionalType } from './utils';
import { parseOptionalExpression, parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';
import { PrintStatement } from '../statement';

export const parsePrint = tokens => {
  // VAX BASIC Ref: page 462
  // Format: PRINT, PRINT expr, PRINT #channel, expr
  popKeyword(tokens, Keyword.PRINT);
  let channel = null;
  let list = [];

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

    let lineFeed = true;
    const tok = popOptionalType(tokens, [TokenType.SEMICOLON, TokenType.COMMA]);

    if (tok && tok.type === TokenType.SEMICOLON) {
      lineFeed = false;
    }

    list.push([expr, lineFeed]);

    if (!tok) {
      break;
    }
  }

  return new PrintStatement(channel, list);
};
