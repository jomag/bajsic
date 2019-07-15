const chai = require('chai');
const expect = chai.expect;

import BasicArray from './BasicArray';

describe('BasicArray', () => {
  describe('constructor', () => {
    it('can create single dimension array', () => {
      const a = new BasicArray('string', [[0, 50]]);
      expect(a.totalSize()).to.equal(50);
    });

    it('can create multi dimension array', () => {
      const a = new BasicArray('string', [[0, 50], [0, 3]]);
      expect(a.totalSize()).to.equal(150);
    });
  });

  describe('set and get methods', () => {
    let a;

    beforeEach('create array', () => {
      a = new BasicArray('int', [[0, 10], [0, 4]]);
    });

    it('can set and get in multi dimension array', () => {
      const data = ['a', 'b', 'c', 'd'];

      for (let j = 0; j < 5; j++) {
        data.forEach((c, i) => a.set([j, i], c));
      }

      for (let j = 0; j < 5; j++) {
        data.forEach((c, i) => expect(a.get([j, i])).to.equal(c));
      }
    });
  });
});
