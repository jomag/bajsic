import { parseExpression } from './expression';
import { Token, TokenType } from '../lex';
import {
  ConstExpr,
  ValueType,
  CallExpr,
  AddExpr,
  MultiplyExpr,
  ExprType,
  IdentifierExpr
} from '../expr';

const chai = require('chai');
const expect = chai.expect;

const { INT, PLUS, IDENTIFIER, LPAR, RPAR, STRING, COMMA, NOT } = TokenType;

function printExprTree(expr, indent) {
  const indent2 = indent || '';

  if (expr === undefined) {
    console.log(`${indent}undefined`);
    return;
  }

  console.log(
    `${indent2}${expr.type} ${expr.value !== undefined ? expr.value : ''}`
  );
  if (expr.children) {
    for (let child of expr.children || []) {
      printExprTree(child, indent2 + '--');
    }
  }
}

function compareExpressions(expr1, expr2) {
  function printDiff() {
    console.log('First expression:');
    printExprTree(expr1, '');
    console.log('Second expression:');
    printExprTree(expr2, '');
  }

  if (expr1.type !== expr2.type) {
    printDiff();
    throw new Error(`Type differs: ${expr1.type} vs ${expr2.type}`);
  }

  switch (expr1.type) {
    case ExprType.CONST:
      if (expr1.valueType !== expr2.valueType) {
        printDiff();
        throw new Error(
          `Value type differs: ${expr1.valueType} vs ${expr2.vakueType}`
        );
      }
      if (expr1.value !== expr2.value) {
        printDiff();
        throw new Error(`Value differs: ${expr1.value} vs ${expr2.value}`);
      }
  }

  if (expr1.children || expr2.children) {
    if (!expr1.children || !expr2.children) {
      printDiff();
      throw new Error(
        `Children differ: ${expr1.children} vs ${expr2.childrne}`
      );
    }
    const children = expr1.children.map((child1, i) => [
      child1,
      expr2.children[i]
    ]);
    const result = children.every(pair => compareExpressions(pair[0], pair[1]));

    if (!result) {
      printDiff();
    }

    return result;
  }

  return true;
}

describe('Parse Expressions', () => {
  it('should parse single operand expression', () => {
    const tokens = [new Token(INT, 42)];
    const expr = parseExpression(tokens);
    const result = compareExpressions(expr, new ConstExpr(ValueType.INT, 42));
    expect(result).to.be.true;
  });

  it('should parse simple addition', () => {
    const tokens = [new Token(INT, 10), new Token(PLUS), new Token(INT, 20)];
    const expr = parseExpression(tokens);
    const expected = new AddExpr(
      new ConstExpr(ValueType.INT, 10),
      new ConstExpr(ValueType.INT, 20)
    );
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  it('should parse simple multiplication', () => {
    const tokens = [
      new Token(INT, 4),
      new Token(TokenType.MUL),
      new Token(INT, 6)
    ];
    const expr = parseExpression(tokens);
    const expected = new MultiplyExpr(
      new ConstExpr(ValueType.INT, 4),
      new ConstExpr(ValueType.INT, 6)
    );
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  it('should handle precedence 1/2', () => {
    // 1 + 2 * 3
    const tokens = [
      new Token(INT, 1),
      new Token(TokenType.PLUS),
      new Token(INT, 2),
      new Token(TokenType.MUL),
      new Token(INT, 3)
    ];
    const expr = parseExpression(tokens);
    const expected = new AddExpr(
      new ConstExpr(ValueType.INT, 1),
      new MultiplyExpr(
        new ConstExpr(ValueType.INT, 2),
        new ConstExpr(ValueType.INT, 3)
      )
    );
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  it('should handle precedence 2/2', () => {
    // 1 * 2 + 3
    const tokens = [
      new Token(INT, 1),
      new Token(TokenType.MUL),
      new Token(INT, 2),
      new Token(TokenType.PLUS),
      new Token(INT, 3)
    ];
    const expr = parseExpression(tokens);
    const expected = new AddExpr(
      new MultiplyExpr(
        new ConstExpr(ValueType.INT, 1),
        new ConstExpr(ValueType.INT, 2)
      ),
      new ConstExpr(ValueType.INT, 3)
    );
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  /*
  it('should handle expression ss', () => {
    const tokens = [new Token(INT, 1), new Token(TokenType.COMMA), new Token(INT, 2)];
    const expr = parseExpression(tokens);
    expect(expr.children.map(e => e.value)).to.deep.equal([1, 2]);
  });
  */

  it('should handle function call with one argument', () => {
    const tokens = [
      new Token(IDENTIFIER, 'hello'),
      new Token(LPAR),
      new Token(STRING, 'world'),
      new Token(RPAR)
    ];
    const expr = parseExpression(tokens);
    const expected = new CallExpr(new IdentifierExpr('hello'), [
      new ConstExpr(ValueType.STRING, 'world')
    ]);
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  it('should handle function call with no args', () => {
    const tokens = [
      new Token(IDENTIFIER, 'hello'),
      new Token(LPAR),
      new Token(RPAR)
    ];
    const expr = parseExpression(tokens);
    const expected = new CallExpr(new IdentifierExpr('hello'), []);
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  it('should handle function call with multiple args', () => {
    const tokens = [
      new Token(IDENTIFIER, 'max'),
      new Token(LPAR),
      new Token(INT, 1),
      new Token(COMMA),
      new Token(INT, 2),
      new Token(COMMA),
      new Token(INT, 3),
      new Token(RPAR)
    ];
    const expr = parseExpression(tokens);
    const expected = new CallExpr(new IdentifierExpr('MAX'), [
      new ConstExpr(ValueType.INT, 1),
      new ConstExpr(ValueType.INT, 2),
      new ConstExpr(ValueType.INT, 3)
    ]);
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  it('should handle nested function calls', () => {
    const tokens = [
      new Token(IDENTIFIER, 'A'),
      new Token(LPAR),
      new Token(IDENTIFIER, 'B'),
      new Token(LPAR),
      new Token(IDENTIFIER, 'C'),
      new Token(RPAR),
      new Token(RPAR)
    ];
    const expr = parseExpression(tokens);
    const expected = new CallExpr(new IdentifierExpr('A'), [
      new CallExpr(new IdentifierExpr('B'), [new IdentifierExpr('C')])
    ]);
    expect(compareExpressions(expr, expected)).to.be.true;
  });

  it('should handle "NOT" operator', () => {
    const tokens = [new Token(NOT), new Token(INT, 0)];
    const expr = parseExpression(tokens);
  });
});
