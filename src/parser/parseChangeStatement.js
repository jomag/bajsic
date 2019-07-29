import { popKeyword, popIdentifier } from './utils';
import { parseExpression } from './expression';
import { Keyword } from '../lex';
import { ChangeStatement } from '../statements/ChangeStatement';

export const parseChangeStatement = tokens => {
  popKeyword(tokens, Keyword.CHANGE);
  const fromExpr = parseExpression(tokens);
  popKeyword(tokens, Keyword.TO);
  const toName = popIdentifier(tokens);
  return new ChangeStatement(fromExpr, toName);
};
