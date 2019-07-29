import { popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType } from '../lex';
import { DataStatement } from '../statements/DataStatement';

export const parseDataStatement = tokens => {
  popKeyword(tokens, Keyword.DATA);
  const list = [];

  while (true) {
    //console.log('FIXME!');
    // Should pop literals from tokens...
    popOptionalType(tokens, [TokenType.INT, TokenType.STRING]);

    if (!popOptionalType(tokens, TokenType.COMMA)) {
      break;
    }
  }

  return new DataStatement(list);
};
