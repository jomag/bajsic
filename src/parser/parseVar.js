import { popIdentifier, popOptionalType, popType } from './utils';
import { parseExpression } from './expression';
import { TokenType } from '../lex';
import Var from '../Var';

export const parseVar = tokens => {
  const name = popIdentifier(tokens);
  const index = [];
  let expectMore = false;
  if (popOptionalType(tokens, TokenType.LPAR)) {
    while (!popOptionalType(tokens, TokenType.RPAR)) {
      index.push(parseExpression(tokens));

      if (!popOptionalType(tokens, TokenType.COMMA)) {
        popType(tokens, TokenType.RPAR);
        break;
      }
    }
  }

  return new Var(name.value, index.length ? index : null);
};
