import { popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType } from '../lex';
import { DataStatement } from '../statements/DataStatement';
import { valueFromToken } from './utils';
import { Value } from '../expr';
import { Token } from '../lex';

/**
 * @param {Token[]} tokens
 */
export const parseDataStatement = tokens => {
  popKeyword(tokens, Keyword.DATA);
  const list = [];

  while (true) {
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
