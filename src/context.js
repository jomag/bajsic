// @ts-check
import { Value, ValueType } from './Value';
import { RuntimeError, OutOfDataError } from './error';
import BasicArray from './BasicArray';
import { BasicFunction } from './BasicFunction';
import { UserFunction } from './UserFunction';
import { DataStatement } from './statements/DataStatement';
import { DefStatement } from './statements/DefStatement';
import { Program } from './program';

class Scope {
  // FIXME:
  // There is a problem in that the "proper" notation, object.<string, Value>,
  // is not correctly interpreted by VS Code, while this TypeScript-ish syntax
  // is, even though it's supposedly invalid JSDoc syntax.
  /* eslint-disable jsdoc/valid-types */

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
  /**
   * @param {Support} support
   */
  constructor(support) {
    this.support = support;

    // Program Counter
    this.pc = 0;

    this.scopes = [new Scope()];
    this.forStack = [];
    this.stack = [];
    this.debugger = null;
    this.inputStream = undefined;
    this.outputStream = undefined;

    /** @type {Value[]} */
    this.data = [];

    /** @type {number} */
    this.dataIndex = 0;

    this.options = {
      verbose: false,
    };

    // Temporary fix: define ERROR
    this.scopes[0].variables.ERROR = new Value(ValueType.INT, 0);

    // @ts-ignore
    this.stdout = process.stdout;
  }

  /**
   * @param {Program} program
   */
  prepare(program) {
    this.pc = 0;

    for (const line of program.lines) {
      for (const stmt of line.statements) {
        if (stmt instanceof DefStatement) {
          this.assignUserFunction(stmt.name, new UserFunction(line.num));
        }
      }
    }

    // Build data blocks
    const data = [];
    for (const line of program.lines) {
      for (const stmt of line.statements) {
        if (stmt instanceof DataStatement) {
          data.push(...stmt.list);
        }
      }
    }

    this.data = data;
    this.dataIndex = 0;
  }

  getData() {
    if (this.dataIndex >= this.data.length) {
      throw new OutOfDataError();
    }

    return this.data[this.dataIndex++];
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
   * Returns the value of the variable or constant with the given name
   *
   * @param {string} name
   * @returns {Value}
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
   *
   * @param {string} name
   * @returns {BasicFunction | UserFunction | BasicArray}
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
   * @returns {BasicArray}
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
