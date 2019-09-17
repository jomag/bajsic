import { isKeyword, popKeyword, popOptionalType } from './utils';
import { Keyword, TokenType } from '../lex';
import { parseExpression } from './expression';
import { parseStatement } from './index';
import { IfStatement } from '../statements/ifStatement';
import { GotoStatement } from '../statement';

export const parseIfStatement = tokens => {
  popKeyword(tokens, Keyword.IF);
  const condition = parseExpression(tokens);
  popKeyword(tokens, Keyword.THEN);

  const thenStatements = [];
  const elseStatements = [];

  // Handle special case with a number following the THEN keyword.
  // It should be handled as a GOTO:
  // `IF cond THEN 724` is equal to `IF cond THEN GOTO 724`
  while (tokens.length) {
    if (isKeyword(tokens[0], Keyword.ELSE)) {
      break;
    }

    if (tokens[0].type === TokenType.INT) {
      const line = tokens.shift();
      thenStatements.push(new GotoStatement(line.value));
    } else {
      // FIXME: handle multiple statements
      thenStatements.push(parseStatement(tokens));
    }

    if (!popOptionalType(tokens, TokenType.SEPARATOR)) {
      break;
    }
  }

  if (tokens.length && isKeyword(tokens[0], Keyword.ELSE)) {
    popKeyword(tokens, Keyword.ELSE);

    while (tokens.length) {
      if (tokens.length && tokens[0].type === TokenType.INT) {
        const line = tokens.shift();
        elseStatements.push(new GotoStatement(line.value));
      } else {
        // FIXME: handle more than one statement
        elseStatements.push(parseStatement(tokens));
      }

      if (!popOptionalType(tokens, TokenType.SEPARATOR)) {
        break;
      }
    }
  }

  return new IfStatement(condition, thenStatements, elseStatements);
};
