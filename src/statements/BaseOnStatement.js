import { BaseStatement } from '../statement';

export class BaseOnStatement extends BaseStatement {
  constructor(type, expr, targets, otherwise) {
    super(type);
    this.expr = expr;
    this.targets = targets;
    this.otherwise = otherwise;
  }
}
