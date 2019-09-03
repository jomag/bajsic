import { popKeyword, popOptionalKeyword, popType } from './utils';
import { Keyword, TokenType } from '../lex';
import { parseExpression } from './expression';
import { OnGosubStatement } from '../statements/OnGosubStatement';
import { OnGotoStatement } from '../statements/OnGotoStatement';

// There's a number of statement types that begins with "ON":
//
// - ON ERROR GO BACK
// - ON ERROR GOTO target
// - ON ERROR GOTO 0
// - ON int-expr GOSUB target ... OTHERWISE target
// - ON int-expr GOTO target ... OTHERWISE target
//
// This interpreter currently only aims to support the last two types

export const parseOnStatement = tokens => {
  popKeyword(tokens, Keyword.ON);
  const expr = parseExpression(tokens);
  const action = popKeyword(tokens, [Keyword.GOTO, Keyword.GOSUB]);
  const targets = [];
  let otherwise;

  while (true) {
    const target = popType(tokens, TokenType.INT);
    targets.push(target.value);
    if (tokens.length && tokens[0].type === TokenType.COMMA) {
      tokens.shift();
    } else {
      break;
    }
  }

  if (popOptionalKeyword(tokens, Keyword.OTHERWISE)) {
    otherwise = popType(tokens, TokenType.INT).value;
  }

  if (action.value === Keyword.GOTO) {
    return new OnGotoStatement(expr, targets, otherwise);
  } else {
    return new OnGosubStatement(expr, targets, otherwise);
  }
};
