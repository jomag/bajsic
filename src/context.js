// @ts-check
import { Value, ValueType } from './expr';
import { RuntimeError } from './error';
import BasicArray from './BasicArray';
import { BasicFunction } from './BasicFunction';
import { UserFunction } from './UserFunction';

class Scope {
  constructor() {
    /** @type {{ [name: string]: Value}} */
    this.constants = {};

    /** @type {{ [name: string]: Value}} */
    this.variables = {};

    /** @type {{ [name: string]: BasicArray }} */
    this.arrays = {};

    /** @type {{ [name: string]: BasicFunction }} */
    this.functions = {};

    /** @type {{ [name: string]: UserFunction }} */
    this.userFunctions = {};
  }
}

export class Context {
  constructor() {
    // Program Counter, points at the current line index
    this.pc = 0;
    this.scopes = [new Scope()];
    this.forStack = [];
    this.stack = [];
    this.debugger = null;
    this.inputStream = undefined;
    this.outputStream = undefined;

    this.options = {
      verbose: false,
    };

    // Temporary fix: define ERROR
    this.scopes[0].variables.ERROR = new Value(ValueType.INT, 0);

    // @ts-ignore
    this.stdout = process.stdout;
  }

  pushForLoop(data) {
    this.forStack.push(data);
  }

  popForLoop() {
    return this.forStack.pop();
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
   * @param {BasicArray} value
   */
  assignArray(name, value) {
    this.scopes[0].arrays[name.toUpperCase()] = value;
  }

  /**
   * @param {string} name
   * @param {BasicFunction} value
   */
  assignFunction(name, value) {
    this.scopes[0].functions[name.toUpperCase()] = value;
  }

  /**
   * @param {string} name
   * @param {UserFunction} value
   */
  assignUserFunction(name, value) {
    this.scopes[0].userFunctions[name.toUpperCase()] = value;
  }

  /**
   * @param {string} name
   * @param {number[]} index
   * @param {Value} value
   */
  setArrayItem(name, index, value) {
    const nm = name.toUpperCase();

    for (const scope of this.scopes) {
      const v = scope.arrays[nm];

      if (v !== undefined) {
        v.set(index, value);
        return;
      }
    }

    throw new RuntimeError(`${name} is not defined`);
  }

  /**
   * Returns the variable or constant with the given name
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

  /**
   * Returns array, function or user function with the given name
   * @param {string} name
   */
  getSubscripted(name) {
    const nm = name.toUpperCase();

    for (const scope of this.scopes) {
      const userFun = scope.userFunctions[nm];
      if (userFun) {
        return userFun;
      }

      const fun = scope.functions[nm];
      if (fun) {
        return fun;
      }

      const array = scope.arrays[nm];
      if (array) {
        return array;
      }
    }
  }

  /**
   * @param {string} name
   */
  getArray(name) {
    const nm = name.toUpperCase();

    for (const scope of this.scopes) {
      const array = scope.arrays[nm];
      if (array) {
        return array;
      }
    }
  }
}
