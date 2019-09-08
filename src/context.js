// @ts-check
import { Value, ValueType } from './expr';
import { RuntimeError } from './evaluate';

class Scope {
  constructor() {
    this.constants = {};
    this.variables = {};
  }
}

export class Context {
  constructor() {
    // Program Counter, points at the current line index
    this.pc = 0;
    this.scopes = [new Scope()];
    this.stack = [];
    this.debugger = null;

    this.options = {
      verbose: false,
    };

    // Temporary fix: define ERROR
    this.scopes[0].variables.ERROR = new Value(ValueType.INT, 0);

    // @ts-ignore
    this.stdout = process.stdout;
  }

  scope() {
    const s = new Scope();
    this.scopes.unshift(s);
    return s;
  }

  descope() {
    return this.scopes.shift();
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
    this.scopes[0].constants[name.toUpperCase()] = value;
  }

  assignVariable(name, value) {
    this.scopes[0].variables[name.toUpperCase()] = value;
  }

  /**
   * @param {string} name
   * @param {number[]} index
   * @param {Value} value
   */
  setArrayItem(name, index, value) {
    const nm = name.toUpperCase();

    for (const scope of this.scopes) {
      const v = scope.variables[nm];

      if (v.type !== ValueType.ARRAY) {
        throw new RuntimeError(`${name} is not an array: ${v.type}`);
      }

      v.value.set(index, value);
      return;
    }

    throw new RuntimeError(`${name} is not defined`);
  }

  /**
   * @param {string} name
   */
  get(name) {
    const nm = name.toUpperCase();

    for (const scope of this.scopes) {
      const v = scope.variables[nm];
      if (v !== undefined) {
        return v;
      }

      const c = scope.constants[nm];
      if (c !== undefined) {
        return c;
      }
    }
  }
}
