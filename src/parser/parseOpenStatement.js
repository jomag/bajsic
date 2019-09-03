// FIXME: Incomplete parser. There's a lot of options
// that are not (yet?) handled.

import { popKeyword, popOptionalType, popOptionalKeyword } from './utils';
import { Keyword, TokenType } from '../lex';
import { OpenStatement, OpenMode } from '../statements/OpenStatement';
import { parseExpression } from './expression';

export const parseOpenStatement = tokens => {
  popKeyword(tokens, Keyword.OPEN);
  const filename = parseExpression(tokens);
  let mode;

  if (popOptionalKeyword(tokens, Keyword.FOR)) {
    const modeToken = popKeyword(tokens, [Keyword.INPUT, Keyword.OUTPUT]);
    if (modeToken.value === Keyword.INPUT) {
      mode = OpenMode.INPUT;
    }
    if (modeToken.value === Keyword.OUTPUT) {
      mode = OpenMode.OUTPUT;
    }
  }

  popKeyword(tokens, Keyword.AS);
  popOptionalKeyword(tokens, Keyword.FILE);
  popOptionalType(tokens, TokenType.HASH);
  const channel = parseExpression(tokens);

  return new OpenStatement(filename, mode, channel);
};
