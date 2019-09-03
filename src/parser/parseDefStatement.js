import {
  popKeyword,
  popIdentifier,
  popOptionalType,
  popType,
  popOptionalDataType
} from './utils';
import { Keyword, TokenType } from '../lex';
import { DefStatement } from '../statements/DefStatement';

export const parseDefStatement = tokens => {
  popKeyword(tokens, Keyword.DEF);
  const dataType = popOptionalDataType(tokens);
  const name = popIdentifier(tokens);
  const args = [];

  if (popOptionalType(tokens, TokenType.LPAR)) {
    while (true) {
      const type = popOptionalDataType(tokens);
      const name = popIdentifier(tokens);
      args.push({ type, name });
      const tok = popType(tokens, [TokenType.COMMA, TokenType.RPAR]);
      if (tok.type === TokenType.RPAR) {
        break;
      }
    }
  }

  return new DefStatement(dataType, name, args);
};
