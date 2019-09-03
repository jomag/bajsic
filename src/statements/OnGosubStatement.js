import { BaseOnStatement } from './BaseOnStatement';
import { StatementType } from '../statement';

export class OnGosubStatement extends BaseOnStatement {
  constructor(expr, targets, otherwise) {
    super(StatementType.ON_GOSUB, expr, targets, otherwise);
  }
}
