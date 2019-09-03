import { popKeyword, popOptionalIdentifier } from './utils';
import { Keyword } from '../lex';
import { NextStatement } from '../statements/nextStatement';

export const parseNextStatement = tokens => {
  popKeyword(tokens, Keyword.NEXT);
  const name = popOptionalIdentifier(tokens);
  return new NextStatement(name);
};
