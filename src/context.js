
export class Context {
  constructor() {
    // Program Counter, points at the current line index
    this.pc = 0;
    this.variables = {};
  }
}