import { DefStatement } from './statements/DefStatement';

export class Program {
  constructor(lines) {
    // Array of lines in sorted order
    this.lines = [];

    // Map of line number to line index
    this.lineToIndexMap = undefined;

    lines && lines.map(line => this.add(line));
  }

  add(line) {
    if (!line.num && line.num !== 0) {
      throw new SyntaxError(
        `Attempt to add line without line number to program: ${line.source}`
      );
    }

    // Invalidate the line map
    this.lineToIndexMap = undefined;

    const { num } = line;

    for (let i = 0; i <= this.lines.length; i++) {
      if (i === this.lines.length || this.lines[i].num > num) {
        this.lines.splice(i, 0, line);
        break;
      }

      if (this.lines[i].num === num) {
        this.lines[i] = line;
        break;
      }
    }
  }

  getUserFunctions() {
    const functions = [];

    for (const line of this.lines) {
      for (const stmt of line.statements) {
        if (stmt instanceof DefStatement) {
          functions[stmt.name] = line.num;
        }
      }
    }

    return functions;
  }

  getLineMap() {
    // FIXME: not tested yet
    if (!this.lineToIndexMap) {
      this.lineToIndexMap = this.lines.reduce((m, line, i) => {
        m[line.num] = i;
        return m;
      }, {});
    }
    return this.lineMap;
  }

  getRange(from, to) {
    // We don't know if 'from' and 'to' points directly
    // at lines that are defined, so we can't rely on the line
    // map to find the first and last index to return.
    return this.lines.filter(line => line.num >= from && to >= line.num);
  }

  lineNumberToIndex(num) {
    // Optimize: build and reuse a line number to index map
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].num === num) {
        return i;
      }
    }
  }

  lineIndexToNumber(idx) {
    return this.lines[idx].num;
  }

  getLineByNumber(num) {
    const idx = this.lineNumberToIndex(num);
    return this.lines[idx];
  }
}
