export const ExprType = Object.freeze({
  // { type: CONSTANT, valueType: INT, value: 42 }
  CONST: 1,

  // { type: IDENTIFIER, name: 'variableName' }
  IDENT: 2,

  // Binary operands: { type: ADD, children: [ <left expr>, <right expr> ] }
  ADD: 100,
  SUB: 101
});

export const ValueType = Object.freeze({
  INT: 'int',
  STRING: 'string'
});

export class Expr {
  constructor(type) {
    this.type = type;
  }

  evaluate() {
    throw new Error('Evaluation method not implemented!');
  }
}

export class ConstExpr extends Expr {
  constructor(valueType, value) {
    super(ExprType.CONST);
    this.valueType = valueType;
    this.value = value;
  }

  evaluate() {
    return { type: this.valueType, value: this.value };
  }

  toString() {
    return `${this.valueType.toUpperCase()}(${this.value})`;
  }
}

export class BinaryOperatorExpr extends Expr {
  constructor(exprType, child1, child2) {
    super(exprType);
    this.children = [child1, child2];
  }

  toString() {
    return `ADD(${this.children[0].toString()}, ${this.children[1].toString()})`;
  }
}

export class AddExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.ADD, child1, child2);
  }

  evaluate() {
    const result1 = this.children[0].evaluate();
    const result2 = this.children[1].evaluate();
    return { type: ValueType.INT, value: result1.value + result2.value };
  }
}
