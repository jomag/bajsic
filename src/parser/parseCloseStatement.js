import { popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType } from '../lex';
import { parseExpression } from './expression';
import { CloseStatement } from '../statements/CloseStatement';

export const parseCloseStatement = tokens => {
  popKeyword(tokens, Keyword.CLOSE);
  let channel;

  popOptionalType(tokens, TokenType.HASH);
  channel = parseExpression(tokens);

  return new CloseStatement(channel);
};
