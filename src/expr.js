export const Op = {
  OPERAND: 'operand',
  PLUS: '+',
  MINUS: '-',
};

export const ValueType = {
  INT: 'int',
  STRING: 'string',
};

export class Value {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  copy(value) {
    return new Value(this.type, this.value);
  }

  static newInt(value) {
    return new Value(ValueType.INT, Number(value));
  }

  static newString(value) {
    return new Value(ValueType.STRING, value.toString());
  }
}

export class Expression {
  constructor(op, value, children) {
    this.op = op;
    this.value = value;
    this.children = children;
  }

  static binaryOp(op, left, right) {
    return new Expression(op, undefined, [left, right]);
  }

  static operand(value) {
    return new Expression(Op.OPERAND, value);
  }

  evaluate() {
    switch (this.op) {
      case Op.OPERAND:
        return this.value.copy();
      case Op.PLUS: {
        const left = this.children[0].evaluate();
        const right = this.children[1].evaluate();
        // FIXME: Naive: left and right may be a variable or function
        return Value.newInt(left.value + right.value);
      }
      case Op.MINUS: {
        const left = this.children[0].evaluate();
        const right = this.children[1].evaluate();
        // FIXME: Naive: left and right may be a variable or function
        return Value.newInt(left.value - right.value);
      }

      default:
        throw new Error(`Unhandled expression type: ${this.op}`);
    }
  }
}
