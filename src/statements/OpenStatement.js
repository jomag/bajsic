import { BaseStatement, StatementType } from '../statement';
import { Enum } from '../utils';

export const OpenMode = Enum(['INPUT', 'OUTPUT']);

export class OpenStatement extends BaseStatement {
  constructor(filename, channel) {
    super(StatementType.OPEN);
    this.filename = filename;
    this.channel = channel;
  }

  exec(program, context) {
    throw new Error('OPEN is not implemented');
  }
}
