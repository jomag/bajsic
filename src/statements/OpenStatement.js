import { BaseStatement, StatementType } from '../statement';

export const OpenMode = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT'
};

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
