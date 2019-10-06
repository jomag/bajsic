import { expect } from 'chai';
import { Value, ValueType } from './Value';
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

    it('can fill matrix and read it back', () => {
      const m = new BasicArray(ValueType.INT, [[0, 3], [0, 3]]);

      for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
          m.set([i, j], new Value(ValueType.INT, i * 100 + j));
        }
      }

      for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
          const val = m.get([i, j]);
          expect(val.value).to.equal(i * 100 + j);
        }
      }
    });

    it('can set and get in multi dimension array', () => {
      const data = ['a', 'b', 'c', 'd'];

      for (let j = 0; j < 5; j++) {
        // eslint-disable-next-line
        data.forEach((c, i) => a.set([j, i], new Value(ValueType.INT, c)));
      }

      for (let j = 0; j < 5; j++) {
        // eslint-disable-next-line
        data.forEach((c, i) => {
          const item = a.get([j, i]);
          expect(item.value).to.equal(c);
        });
      }
    });
  });
});
