// @ts-check
import { Value, ValueType } from './expr';

export class Context {
  constructor() {
    // Program Counter, points at the current line index
    this.pc = 0;
    this.constants = {};
    this.variables = {};

    this.options = {
      verbose: false
    };

    // Temporary fix: define ERROR
    this.variables.ERROR = new Value(ValueType.INT, 0);

    // @ts-ignore
    this.stdout = process.stdout;
  }

  assignConst(name, value) {
    this.constants[name] = value;
  }

  assignVariable(name, value) {
    this.variables[name] = value;
  }

  /**
   * @param {string} name
   * @param {number[]} index
   * @param {Value} value
   */
  setArrayItem(name, index, value) {
    this.variables[name].set(index, value);
  }

  get(name) {
    const value = this.variables[name];
    if (value !== undefined) {
      return value;
    }
    return this.constants[name];
  }
}
