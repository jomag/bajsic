import { Enum } from './utils';
import { RuntimeError } from './evaluate';

export const ExprType = Enum([
  // { type: CONSTANT, valueType: INT, value: 42 }
  'CONST',

  // { type: IDENTIFIER, name: 'variableName' }
  'IDENT',

  // Binary operands: { type: ADD, children: [ <left expr>, <right expr> ] }
  'ADD',
  'SUBTRACT',
  'MULTIPLY',

  // Function call, or array indexation
  'CALL',

  // Expression list, for example function arguments
  'GROUP'
]);

export const ValueType = Enum(['INT', 'STRING', 'FUNCTION']);

export class Value {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

export class Expr {
  constructor(type) {
    this.type = type;
  }

  evaluate(context) {
    throw new Error('Evaluation method not implemented!');
  }
}

export class ConstExpr extends Expr {
  constructor(valueType, value) {
    super(ExprType.CONST);
    this.valueType = valueType;
    this.value = value;
  }

  evaluate(context) {
    return { type: this.valueType, value: this.value };
  }

  toString() {
    return `${this.valueType.toUpperCase()}(${this.value})`;
  }
}

export class IdentifierExpr extends Expr {
  constructor(value) {
    super(ExprType.IDENT);
    this.value = value;
  }

  evaluate(context) {
    return context.get(this.value);
  }

  toString() {
    return `IDENTIFIER:${this.value}`;
  }
}

export class CallExpr extends Expr {
  constructor(fun, args) {
    super(ExprType.CALL);
    this.children = [fun, ...(args || [])];
  }

  addArgument(expr) {
    this.children.push(expr);
  }

  toString() {
    return `Call`;
  }

  evaluate(context) {
    const values = this.children.map(expr => expr.evaluate(context));

    if (values[0].type !== ValueType.FUNCTION) {
      throw new RuntimeError('Not a function');
    }

    return values[0].value.call(values.slice(1));
  }
}

export class BinaryOperatorExpr extends Expr {
  constructor(exprType, child1, child2) {
    super(exprType);
    this.children = [child1, child2];
  }
}

export class AddExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.ADD, child1, child2);
  }

  evaluate(context) {
    const result1 = this.children[0].evaluate(context);
    const result2 = this.children[1].evaluate(context);
    return new Value(ValueType.INT, result1.value + result2.value);
  }
}

export class MultiplyExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.MULTIPLY, child1, child2);
  }

  evaluate(context) {
    const result1 = this.children[0].evaluate(context);
    const result2 = this.children[1].evaluate(context);
    return new Value(ValueType.INT, result1.value * result2.value);
  }
}
