import {
  popType,
  popKeyword,
  popOptionalType,
  popOptionalKeyword,
} from './utils';
import { Keyword, TokenType } from '../lex';
import {
  InputStatement,
  InputLineStatement,
} from '../statements/inputStatement';
import { parseExpression } from './expression';
import { parseVar } from './parseVar';

export const parseInputStatement = (tokens) => {
  popKeyword(tokens, Keyword.INPUT);
  let channel;
  let tok;
  const list = [];

  const isLineInput = !!popOptionalKeyword(tokens, Keyword.LINE);

  if (popOptionalType(tokens, TokenType.HASH)) {
    channel = parseExpression(tokens);
    popType(tokens, TokenType.COMMA);
  }

  while (tokens.length) {
    let str;
    let separator = false;

    tok = popOptionalType(tokens, TokenType.STRING);

    if (tok) {
      str = tok.value;

      const separatorToken = popType(tokens, [
        TokenType.COMMA,
        TokenType.SEMICOLON,
        TokenType.UNDERSCORE,
      ]);

      separator = separatorToken.value;
    }

    const identifier = parseVar(tokens);

    list.push({
      str,
      separator,
      identifier,
    });

    if (!popOptionalType(tokens, [TokenType.COMMA, TokenType.SEMICOLON])) {
      break;
    }
  }

  return isLineInput
    ? new InputLineStatement(channel, list)
    : new InputStatement(channel, list);
};
