const chai = require('chai');
const expect = chai.expect;

import { Expression, Value, ValueType, Op } from './expr';

describe('Expression', () => {
  it('evalutes single leaf tree', () => {
    const e = Expression.operand(Value.newInt(42));
    const v = e.evaluate();
    expect(v).to.deep.equal({ type: ValueType.INT, value: 42 });
  });

  it('evaluates nested tree', () => {
    const e = Expression.binaryOp(
      Op.PLUS,
      Expression.binaryOp(Op.MINUS, Value.newInt(5), Value.newInt(3)),
      Expression.binaryOp(Op.PLUS, Value.newInt(8), Value.newInt(1)),
    );
    const v = e.evaluate();
    expect(v).to.deep.equal({ type: ValueType.INT, value: 11.1 })
  });
});
