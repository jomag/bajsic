export class Line {
  constructor(source) {
    // Contains the original source code of this line
    this.source = source;
    this.num = undefined;
    this.statements = [];
  }
}
