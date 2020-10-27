import { expect } from 'chai';
import Var from '../Var';
import { Context } from '../context';
import { ConstExpr } from '../expr';
import { ValueType } from '../Value';
import { LetStatement } from './LetStatement';
import BasicArray from '../BasicArray';

describe('LetStatement', () => {
  it('assigns value to variable', async () => {
    const context = new Context();
    const expr = new ConstExpr(ValueType.STRING, 'Popcorn!');
    const identifier = new Var('a$');
    const stmt = new LetStatement(identifier, expr);
    await stmt.exec(undefined, context);
    expect(context.scopes[0].variables['A$']).to.deep.equal({
      type: ValueType.STRING,
      value: 'Popcorn!',
    });
  });

  it('assigns value to array index', async () => {
    const context = new Context();
    context.assignArray(
      'v',
      new BasicArray(ValueType.STRING, [
        [0, 3],
        [0, 3],
      ])
    );

    const stmt = new LetStatement(
      new Var('v', [
        new ConstExpr(ValueType.INT, 1),
        new ConstExpr(ValueType.INT, 2),
      ]),
      new ConstExpr(ValueType.STRING, 'Penguin!')
    );

    await stmt.exec(undefined, context);
    const v = context.scopes[0].arrays.V;

    expect(v.get([1, 2])).to.deep.equal({
      type: ValueType.STRING,
      value: 'Penguin!',
    });
  });
});
