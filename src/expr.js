import { RuntimeError, InternalError } from './error';
import { BasicFunction } from './BasicFunction';
import { UserFunction } from './UserFunction';
import BasicArray from './BasicArray';
import { Value, ValueType } from './Value';

/**
 * @enum {string}
 */
export const ExprType = {
  // { type: CONSTANT, valueType: INT, value: 42 }
  CONST: 'CONST',

  // { type: IDENTIFIER, name: 'variableName' }
  IDENT: 'IDENT',

  // Binary operators: { type: ADD, children: [ <left expr>, <right expr> ] }
  ADD: 'ADD',
  SUBTRACT: 'SUBTRACT',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',

  // Function call, or array indexation
  CALL: 'CALL',

  // Relational operators
  LT: 'LT',
  LE: 'LE',
  GT: 'GT',
  GE: 'GE',
  NE: 'NE',
  EQ: 'EQ',

  // Logical operators
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',
  NOT: 'NOT',

  // Expression list, for example function arguments
  GROUP: 'GROUP',

  // Unary operators
  UMINUS: 'UMINUS',
};

export class Expr {
  constructor(type) {
    this.type = type;
  }

  /**
   * @returns {Value}
   * @abstract
   */
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

  async evaluate() {
    return new Value(this.valueType, this.value);
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

  async evaluate(program, context) {
    // FIXME: handle user functions!
    const name = this.value;

    const sub = context.getSubscripted(name);

    if (sub) {
      if (sub instanceof BasicFunction) {
        return sub.call([], program, context);
      }
    }

    const v = context.get(name);

    if (v) {
      return v;
    }

    // This BASIC dialect defaults undeclared variables
    // to integer of value 0.
    return new Value(ValueType.INT, 0);
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

  async evaluate(program, context) {
    const funExpr = this.children[0];
    const args = this.children.slice(1);

    if (funExpr.type !== ExprType.IDENT) {
      throw new RuntimeError(
        'Only single identifier expressions are supported for function expressions'
      );
    }

    const argValues = [];
    for (const expr of args) {
      argValues.push(await expr.evaluate(program, context));
    }

    const name = funExpr.value;

    const sub = context.getSubscripted(name);

    if (!sub) {
      throw new RuntimeError(`${name} is not a function or array`);
    }

    if (sub instanceof BasicFunction) {
      return sub.call(argValues, program, context);
    }

    if (sub instanceof UserFunction) {
      return sub.call(argValues, program, context);
    }

    if (sub instanceof BasicArray) {
      const index = argValues.map(arg => arg.value);
      return sub.get(index);
    }

    throw new InternalError(
      `${name} is not a function, user function or array`
    );
  }
}

export class BinaryOperatorExpr extends Expr {
  constructor(exprType, child1, child2) {
    super(exprType);

    if (!child1 || !child2) {
      throw new Error(
        `Internal error: created binary operator with falsy children:\n` +
          `Expression type: ${exprType}\n` +
          `Child 1: ${JSON.stringify(child1)}\n` +
          `Child 2: ${JSON.stringify(child2)}`
      );
    }

    this.children = [child1, child2];
  }
}

export class AddExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.ADD, child1, child2);
  }

  async evaluate(program, context) {
    const value1 = await this.children[0].evaluate(program, context);
    const value2 = await this.children[1].evaluate(program, context);

    if (value1.type === ValueType.STRING && value2.type === ValueType.STRING) {
      return new Value(ValueType.STRING, value1.value + value2.value);
    }

    if (value1.isNumeric() && value2.isNumeric()) {
      // FIXME: should not always result in an INT
      return new Value(ValueType.INT, value1.value + value2.value);
    }

    if (value1.type === value2.type) {
      throw new RuntimeError(
        `Adding values of type ${value1.type} is not allowed`
      );
    } else {
      throw new RuntimeError(
        `Adding values of type ${value1.type} and ${value2.type} is not allowed`
      );
    }
  }
}

export class SubtractExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.SUBTRACT, child1, child2);
  }

  async evaluate(program, context) {
    const value1 = await this.children[0].evaluate(program, context);
    const value2 = await this.children[1].evaluate(program, context);
    return new Value(ValueType.INT, value1.value - value2.value);
  }
}

export class DivideExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.DIVIDE, child1, child2);
  }

  async evaluate(program, context) {
    const value1 = await this.children[0].evaluate(program, context);
    const value2 = await this.children[1].evaluate(program, context);
    return new Value(ValueType.INT, value1.value / value2.value);
  }
}

export class AndExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.AND, child1, child2);
  }

  async evaluate(program, context) {
    const value1 = await this.children[0].evaluate(program, context);
    const value2 = await this.children[1].evaluate(program, context);
    return new Value(ValueType.INT, value1.value && value2.value);
  }
}

export class OrExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.OR, child1, child2);
  }

  async evaluate(program, context) {
    const value1 = await this.children[0].evaluate(program, context);
    const value2 = await this.children[1].evaluate(program, context);
    return new Value(ValueType.INT, value1.value || value2.value);
  }
}

export class MultiplyExpr extends BinaryOperatorExpr {
  constructor(child1, child2) {
    super(ExprType.MULTIPLY, child1, child2);
  }

  async evaluate(program, context) {
    const value1 = await this.children[0].evaluate(program, context);
    const value2 = await this.children[1].evaluate(program, context);
    return new Value(ValueType.INT, value1.value * value2.value);
  }
}

export class RelationalOperatorExpr extends BinaryOperatorExpr {
  async evaluate(program, context) {
    const op1 = await this.children[0].evaluate(program, context);
    const op2 = await this.children[1].evaluate(program, context);

    if (!op1) {
      throw new Error(
        `Internal error: left operand of relational operator is ${op1}`
      );
    }

    if (!op2) {
      throw new RuntimeError(
        `Internal error: left operand of relational operator is ${op1}`
      );
    }

    let result;

    switch (this.type) {
      case ExprType.EQ:
        result = op1.value === op2.value;
        break;
      case ExprType.LT:
        result = op1.value < op2.value;
        break;
      case ExprType.LE:
        result = op1.value <= op2.value;
        break;
      case ExprType.GT:
        result = op1.value > op2.value;
        break;
      case ExprType.GE:
        result = op1.value >= op2.value;
        break;
      case ExprType.NE:
        result = op1.value !== op2.value;
        break;
      default:
        throw new RuntimeError('Unhandled relational operator type');
    }

    return new Value(ValueType.INT, result ? -1 : 0);
  }
}

export class UnaryOperatorExpr extends Expr {
  constructor(exprType, operand) {
    super(exprType);
    this.operand = operand;
  }
}

export class NotExpr extends UnaryOperatorExpr {
  constructor(operand) {
    super(ExprType.NOT, operand);
  }

  evaluate() {
    throw new RuntimeError('NOT is not implemented');
  }
}

export class UnaryMinusExpr extends UnaryOperatorExpr {
  constructor(operand) {
    super(ExprType.UMINUS, operand);
  }

  async evaluate(program, context) {
    const value = await this.operand.evaluate(context);

    if (!value.isNumeric()) {
      throw new RuntimeError(`Can't negate value of type "${value.type}"`);
    }

    return new Value(value.type, -value.value);
  }
}
