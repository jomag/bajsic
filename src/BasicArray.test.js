const chai = require('chai');
const expect = chai.expect;

import { Value, ValueType } from './expr';
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
      a = new BasicArray(ValueType.INT, [[0, 10], [0, 4]]);
    });

    it('can set and get in multi dimension array', () => {
      const data = ['a', 'b', 'c', 'd'];

      for (let j = 0; j < 5; j++) {
        data.forEach((c, i) => a.set([j, i], new Value(ValueType.INT, c)));
      }

      for (let j = 0; j < 5; j++) {
        data.forEach((c, i) => {
          const item = a.get([j, i]);
          expect(item.value).to.equal(c);
        });
      }
    });
  });
});
