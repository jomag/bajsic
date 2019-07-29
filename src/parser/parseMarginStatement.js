import { popKeyword, popOptionalType, popType } from './utils';
import { parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';
import { MarginStatement } from '../statements/MarginStatement';

export const parseMarginStatement = tokens => {
  popKeyword(tokens, Keyword.MARGIN);
  let channel;

  if (popOptionalType(tokens, TokenType.HASH)) {
    channel = parseExpression(tokens);
    popType(tokens, TokenType.COMMA);
  }

  const expr = parseExpression(tokens);

  return new MarginStatement(channel, expr);
};
