import { popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType } from '../lex';
import { ResumeStatement } from '../statements/ResumeStatement';

export const parseResumeStatement = tokens => {
  popKeyword(tokens, Keyword.RESUME);
  const target = popOptionalType(tokens, TokenType.INT);
  return new ResumeStatement(target);
};
