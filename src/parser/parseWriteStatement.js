// FIXME: I've not been able to find this command in the VAX BASIC reference
import { popKeyword, popType, popOptionalType } from './utils';
import { WriteStatement } from '../statements/WriteStatement';
import { parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';

export const parseWriteStatement = tokens => {
  popKeyword(tokens, Keyword.WRITE);
  popOptionalType(tokens, TokenType.HASH);
  const channel = parseExpression(tokens);
  popType(tokens, TokenType.COMMA);
  const data = parseExpression(tokens);
  return new WriteStatement(channel, data);
};
