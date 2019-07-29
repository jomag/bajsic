import {
  popType,
  popKeyword,
  popOptionalType,
  popOptionalKeyword
} from './utils';
import { Keyword, TokenType } from '../lex';
import {
  InputStatement,
  InputLineStatement
} from '../statements/inputStatement';
import { parseExpression } from './expression';
import { parseVar } from './parseVar';

export const parseInputStatement = tokens => {
  popKeyword(tokens, Keyword.INPUT);
  let channel;
  let tok;
  let list = [];

  const isLineInput = !!popOptionalKeyword(tokens, Keyword.LINE);

  if (popOptionalType(tokens, TokenType.HASH)) {
    channel = parseExpression(tokens);
    popType(tokens, TokenType.COMMA);
  }

  while (tokens.length) {
    let str;
    let lineFeed = false;

    tok = popOptionalType(tokens, TokenType.STRING);

    if (tok) {
      const lineFeedToken = popType(tokens, [
        TokenType.COMMA,
        TokenType.SEMICOLON,
        TokenType.UNDERSCORE
      ]);

      lineFeed = lineFeedToken.value !== TokenType.COMMA;
    }

    const identifier = parseVar(tokens);

    list.push({
      str,
      lineFeed,
      identifier
    });

    if (!popOptionalType(tokens, [TokenType.COMMA, TokenType.SEMICOLON])) {
      break;
    }
  }

  return isLineInput
    ? new InputLineStatement(channel, list)
    : new InputStatement(channel, list);
};
