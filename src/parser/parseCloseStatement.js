import { popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType } from '../lex';
import { parseExpression } from './expression';
import { CloseStatement } from '../statements/CloseStatement';

export const parseCloseStatement = tokens => {
  popKeyword(tokens, Keyword.CLOSE);

  popOptionalType(tokens, TokenType.HASH);
  const channel = parseExpression(tokens);

  return new CloseStatement(channel);
};
