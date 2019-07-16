import { popKeyword, popType, popOptionalType } from './utils';
import { parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';
import { PrintStatement } from '../statement';

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
