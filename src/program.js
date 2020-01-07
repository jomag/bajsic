import { StatementType } from './statement';
import { BranchStatement } from './statements/BranchStatement';
import { GotoStatement } from './statements/GotoStatement';
import { SyntaxError } from './error';

export class Program {
  constructor() {
    // Array of lines in sorted order
    this.lines = [];

    this.labels = {};
    this.statements = [];
  }

  add(line) {
    const { num } = line;

    if (!num && num !== 0) {
      throw new SyntaxError(
        `Attempt to add line without line number to program: ${line.source}`
      );
    }

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

    return functions;
  }

  getRange(from, to) {
    // We don't know if 'from' and 'to' points directly
    // at lines that are defined, so we can't rely on the line
    // map to find the first and last index to return.
    return this.lines.filter(line => line.num >= from && to >= line.num);
  }

  flatten() {
    const statements = [];
    const labels = {};

    const flattenBlock = block => {
      for (const stmt of block) {
        if (stmt.type === StatementType.IF) {
          const thenLabel = `@${statements.length}.then`;
          const elseLabel = `@${statements.length}.else`;
          const endLabel = `@${statements.length}.end`;

          statements.push(
            new BranchStatement(stmt.conditionExpr, thenLabel, elseLabel)
          );

          labels[thenLabel] = statements.length;
          flattenBlock(stmt.thenStatements);
          statements.push(new GotoStatement(endLabel));
          labels[elseLabel] = statements.length;
          flattenBlock(stmt.elseStatements);
          labels[endLabel] = statements.length;
        } else {
          statements.push(stmt);
        }
        statements.push('eol');
      }
    };

    for (const line of this.lines) {
      labels[line.num] = statements.length;
      flattenBlock(line.statements);
    }

    this.statements = statements;
    this.labels = labels;
  }
}
