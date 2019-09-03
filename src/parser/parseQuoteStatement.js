import { popKeyword, popType } from './utils';
import { parseExpression } from './expression';
import { Keyword, TokenType } from '../lex';
import { QuoteStatement } from '../statements/QuoteStatement';

export const parseQuoteStatement = tokens => {
  popKeyword(tokens, Keyword.QUOTE);
  popType(tokens, TokenType.HASH);
  const channel = parseExpression(tokens);
  return new QuoteStatement(channel);
};
