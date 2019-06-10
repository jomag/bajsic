import { Expression } from '../expr';
import { TokenType } from '../lex';

export const parseExpression = tokens => {
  const expr = new Expression();

  while (tokens.length > 0) {
    const tok = tokens[0];

    switch (tok.type) {
      case TokenType.INT:
        expr.add(tok);
        break;

      default:
        return;
    }

    tokens.shift();
  }
};

// export const oldParseExpression = tokens => {
//   // FIXME: very simplified expression parser!
//   const expr = [];

//   while (tokens.length > 0) {
//     const tok = tokens[0];

//     if ([TokenType.COMMA, TokenType.SEMICOLON].includes(tok.type)) {
//       return expr;
//     }

//     if (isKeyword(tok, Keyword.THEN) || isKeyword(tok, Keyword.ELSE)) {
//       return expr;
//     }

//     expr.push(tokens.shift());
//   }

//   return expr;
// };
