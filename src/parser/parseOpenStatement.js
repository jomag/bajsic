import { popKeyword, popOptionalType, popOptionalKeyword } from './utils';
import { Keyword, TokenType } from '../lex';
import { OpenStatement } from '../statements/OpenStatement';
import { parseExpression } from './expression';
import { OpenMode } from '../support';

export const parseOpenStatement = tokens => {
  popKeyword(tokens, Keyword.OPEN);
  const filename = parseExpression(tokens);
  let mode = OpenMode.INPUT;

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
