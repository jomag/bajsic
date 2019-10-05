import { popKeyword, popOptionalType, valueFromToken } from './utils';
import { Keyword, TokenType, Token } from '../lex';
import { DataStatement } from '../statements/DataStatement';

/**
 * @param {Token[]} tokens
 * @returns {DataStatement}
 */
export const parseDataStatement = tokens => {
  popKeyword(tokens, Keyword.DATA);
  const list = [];

  for (;;) {
    // Should pop literals from tokens...
    const tok = popOptionalType(tokens, [
      TokenType.INT,
      TokenType.FLOAT,
      TokenType.STRING,
    ]);

    if (!tok) {
      break;
    }

    list.push(valueFromToken(tok));

    if (!popOptionalType(tokens, TokenType.COMMA)) {
      break;
    }
  }

  return new DataStatement(list);
};
