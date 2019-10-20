export class Line {
  constructor(source, sourceLineNo) {
    this.source = source;
    this.sourceLineNo = sourceLineNo;
    this.num = undefined;
    this.statements = [];
  }
}
