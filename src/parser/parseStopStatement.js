import { popKeyword } from './utils';
import { StopStatement } from '../statements/StopStatement';
import { Keyword } from '../lex';

export const parseStopStatement = tokens => {
  popKeyword(tokens, Keyword.STOP);
  return new StopStatement();
};
