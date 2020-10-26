import { Value, ValueType, castValue } from '../Value';
import Var from '../Var';
import { Program } from '../program';
import { Context } from '../context';

/**
 * @param {Program} program
 * @param {Context} context
 * @param {Var} identifier
 * @param {Value} value
 */
export const assignIdentifierValue = async (
  program,
  context,
  identifier,
  value
) => {
  if (identifier.index) {
    const index = [];

    for (const expr of identifier.index) {
      index.push(await expr.evaluate(program, context));
    }

    const numIndex = index.map(indexValue => {
      return castValue(indexValue, ValueType.INT).value;
    });

    context.setArrayItem(identifier.name, numIndex, value);
  } else {
    context.assignVariable(identifier.name, value);
  }
};
