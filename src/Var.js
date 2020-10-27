// @ts-check

// Var is used to reference a variable in assignment, READ
// and INPUT statements. A Var is either a variable
// name, or a name plus index into a single or multi-
// dimensional array:
//
// - foo
// - foo(1)
// - foo(1, 2, 3)
//
// Note that the Var class is *not* used in expressions
// as there's no way to differentiate between a function
// call and an index in an array.
import { Expr } from './expr';
import { ValueType } from './Value';

export const valueTypeFromName = name => {
  if (name.endsWith('$')) {
    return ValueType.STRING;
  }

  if (name.endsWith('%')) {
    return ValueType.INT;
  }

  return ValueType.FLOAT;
};

export default class Var {
  /**
   * @param {string} name
   * @param {Expr[]} index
   */
  constructor(name, index) {
    this.name = name;
    this.index = index;
  }

  getType() {
    return valueTypeFromName(this.name);
  }
}
