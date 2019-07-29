// Var is used to reference a variable in assignment
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
// call and an index in an array:

export default class Var {
  constructor(name, index) {
    this.name = name;
    this.index = index;
  }
}
