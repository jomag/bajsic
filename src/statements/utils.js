import { RuntimeError } from '../error';
import { Value, ValueType } from '../expr';
import Var from '../Var';

/**
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
      if (indexValue.type !== ValueType.INT) {
        throw new RuntimeError(
          'Only numeric values are allowed as array index'
        );
      }
      return indexValue.value;
    });

    context.setArrayItem(identifier.name, numIndex, value);
  } else {
    context.assignVariable(identifier.name, value);
  }
};
