import { parseExpression } from './expression';
import { Token, TokenType } from '../lex';

const INT = TokenType.INT;
const PLUS = TokenType.PLUS;

function printExprTree(expr, indent) {
  console.log(`${indent}${expr.type}`);
  if (expr.children) {
    for (let child of expr.children || []) {
      printExprTree(child, indent + '  ');
      printExprTree(child, indent + '  ');
    }
  }
}

describe('YparseExpression', () => {
  it('should parse single operand expression', () => {
    const tokens = [new Token(INT, 42)];
    const expr = parseExpression(tokens);
    printExprTree(expr, '');
  });

  it('should parse simple addition', () => {
    const tokens = [new Token(INT, 10), new Token(PLUS), new Token(INT, 20)];
    const expr = parseExpression(tokens);
    printExprTree(expr, '');
  });
});
