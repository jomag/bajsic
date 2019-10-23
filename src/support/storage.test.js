import { expect } from 'chai';
import Support, { OpenMode } from './storage';

describe('Class: Support', () => {
  let support;

  beforeEach(() => {
    support = new Support();
  });

  afterEach(() => support.finalize());

  describe('readLine', () => {
    beforeEach(() => support.open(`${__dirname}/test.txt`, OpenMode.INPUT, 1));
    afterEach(() => support.close(1));

    it('should read file line by line', async () => {
      const line1 = await support.readLine(1);
      const line2 = await support.readLine(1);
      expect(line1).to.equal('Hello');
      expect(line2).to.equal('This is only a test');
    });
  });
});
