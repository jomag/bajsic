import { popKeyword } from './utils';
import { Keyword, TokenType } from '../lex';
import { Statement } from './';
import { StatementType } from '../statement';

export const parseList = tokens => {
  // VAX BASIC Ref: page 109
  // Format: LIST, LIST n, LIST n-m, LIST n,n-m,...
  popKeyword(tokens, Keyword.LIST);
  let ranges = [];

  if (tokens.length) {
    let from = null;
    let to = null;
    let expectRange = false;

    const append = () => {
      if (expectRange) {
        if (from === null || to === null) {
          throw new SyntaxError('Incomplete range');
        }
        ranges.push([from, to]);
      } else {
        if (from === null) {
          new SyntaxError('Missing line number');
        }
        ranges.push([from, from]);
      }

      expectRange = false;
      from = null;
      to = null;
    };

    while (tokens.length) {
      const tok = tokens.shift();

      switch (tok.type) {
        case TokenType.INT:
          if (expectRange) {
            to = tok.value;
          } else {
            if (from !== null) {
              throw new SyntaxError('Invalid range');
            }
            from = tok.value;
          }
          break;

        case TokenType.COMMA:
          append();
          break;

        case TokenType.MINUS:
          if (from === null) {
            throw new SyntaxError('Negative line number is not allowed');
          }
          expectRange = true;
          break;

        default:
          throw new SyntaxError('Invalid tokens in list range');
      }
    }

    append();
  }
  return new Statement(StatementType.LIST, ranges);
};
