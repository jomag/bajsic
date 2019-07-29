import { parseVar } from './parseVar';
import { popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType } from '../lex';
import { ReadStatement } from '../statements/ReadStatement';

export const parseReadStatement = tokens => {
  popKeyword(tokens, Keyword.READ);
  const varList = [];

  while (true) {
    varList.push(parseVar(tokens));
    if (!popOptionalType(tokens, TokenType.COMMA)) {
      break;
    }
  }

  return new ReadStatement(varList);
};
