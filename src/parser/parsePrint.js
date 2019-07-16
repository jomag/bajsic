import { popKeyword, popType } from './utils';
import { parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';
import { Statement } from './';
import { StatementType } from '../statement';

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
  }

  while (tokens.length && tokens[0].type !== TokenType.SEPARATOR) {
    const expr = parseExpression(tokens);

    let lineFeed = true;

    if (tokens.length > 0 && tokens[0].type === TokenType.SEMICOLON) {
      lineFeed = false;
      tokens.shift();
    }

    list.push([expr, lineFeed]);
  }

  return new Statement(StatementType.PRINT, { channel, list });
};
