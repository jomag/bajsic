export class Expression {
  constructor() {
    this.tokens = [];
  }
  add(token) {
    this.tokens.push(token);
  }
}
