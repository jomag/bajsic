// This statement was present in the source code of "Stugan",
// but I've not been able to find it in the DEC BASIC reference.
//
// This is how it's used:
//
// 80105	MARGIN #1,132 \ QUOTE #1 \ X=0'&&&&&

import { BaseStatement, StatementType } from '../statement';

export class QuoteStatement extends BaseStatement {
  constructor(channel) {
    super(StatementType.QUOTE);
    this.channel = channel;
  }

  exec(program, context) {
    throw new Error('QUOTE is not implemented');
  }
}
