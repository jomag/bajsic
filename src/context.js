export class Context {
  constructor() {
    // Program Counter, points at the current line index
    this.pc = 0;
    this.constants = {};
    this.variables = {};
    this.stdout = process.stdout;
  }

  assignConst(name, value) {
    this.constants[name] = value;
  }

  assignVariable(name, value) {
    this.variables[name] = value;
  }

  get(name) {
    const value = this.variables[name];
    if (value !== undefined) {
      return value;
    }
    return this.constants[name];
  }
}
