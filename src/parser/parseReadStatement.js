import { parseVar } from './parseVar';
import { popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType, Token } from '../lex';
import { ReadStatement } from '../statements/ReadStatement';

/**
 * @param {Token[]} tokens
 */
export const parseReadStatement = tokens => {
  popKeyword(tokens, Keyword.READ);
  const list = [];

  while (true) {
    list.push(parseVar(tokens));
    if (!popOptionalType(tokens, TokenType.COMMA)) {
      break;
    }
  }

  return new ReadStatement(list);
};
