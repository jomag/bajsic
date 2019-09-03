// @ts-check
import { Value, ValueType } from './expr';
import { RuntimeError } from './evaluate';

export class Context {
  constructor() {
    // Program Counter, points at the current line index
    this.pc = 0;
    this.constants = {};
    this.variables = {};
    this.stack = [];

    this.options = {
      verbose: false
    };

    // Temporary fix: define ERROR
    this.variables.ERROR = new Value(ValueType.INT, 0);

    // @ts-ignore
    this.stdout = process.stdout;
  }

  /**
   * @param {number} value
   */
  push(value) {
    this.stack.push(value);
  }

  /**
   * @returns {number}
   */
  pop() {
    if (this.stack.length === 0) {
      throw new RuntimeError('Pop on empty stack');
    }

    return this.stack.pop();
  }

  assignConst(name, value) {
    this.constants[name.toUpperCase()] = value;
  }

  assignVariable(name, value) {
    this.variables[name.toUpperCase()] = value;
  }

  /**
   * @param {string} name
   * @param {number[]} index
   * @param {Value} value
   */
  setArrayItem(name, index, value) {
    const v = this.variables[name.toUpperCase()];

    if (!v) {
      throw new RuntimeError(`${name} is not defined`);
    }

    if (v.type !== ValueType.ARRAY) {
      throw new RuntimeError(`${name} is not an array: ${v.type}`);
    }

    v.value.set(index, value);
  }

  /**
   * @param {string} name
   */
  get(name) {
    const nm = name.toUpperCase();
    const value = this.variables[nm];
    if (value !== undefined) {
      return value;
    }
    return this.constants[nm];
  }
}
