import { expect } from 'chai';

import { parseStatement } from '.';
import { StatementType } from '../statement';
import { tokenize, TokenType } from '../lex';
import { ValueType } from '../Value';
import { ExprType } from '../expr';

const T = text => tokenize(text);
const P = text => parseStatement(T(text));

describe('Parse Statements', () => {
  describe('DIM', () => {
    it('handles single, one dimensional array', () => {
      const s = P('DIM A(5)');
      expect(s.type).to.equal(StatementType.DIM);
      expect(s.arrays).to.deep.equal({
        A: [[0, 5]],
      });
    });

    it('handles single, multi-dimensional array', () => {
      const s = P('DIM A(5, 10, 15)');
      expect(s.type).to.equal(StatementType.DIM);
      expect(s.arrays).to.deep.equal({
        A: [[0, 5], [0, 10], [0, 15]],
      });
    });

    it('handles multiple, multi-dimensional arrays', () => {
      const s = P('DIM A(11, 22), B(33, 44)');
      expect(s.type).to.equal(StatementType.DIM);
      expect(s.arrays).to.deep.equal({
        A: [[0, 11], [0, 22]],
        B: [[0, 33], [0, 44]],
      });
    });
  });

  describe('LIST', () => {
    it('without lines', () => {
      const s = P('LIST');
      expect(s.type).to.equal(StatementType.LIST);
      expect(s.ranges).to.deep.equal([]);
    });

    it('with single line', () => {
      const s = P('LIST 10');
      expect(s.ranges).to.deep.equal([[10, 10]]);
    });

    it('with single range', () => {
      const s = P('LIST 20-30');
      expect(s.ranges).to.deep.equal([[20, 30]]);
    });

    it('with multiple lines and ranges', () => {
      const s = P('LIST 10,20-30,40,50-60');
      expect(s.ranges).to.deep.equal([[10, 10], [20, 30], [40, 40], [50, 60]]);
    });
  });

  describe('PRINT', () => {
    it('empty', () => {
      const s = P('PRINT');
      expect(s.type).to.equal(StatementType.PRINT);
      // expect(s.data).to.deep.equal({ channel: null, list: [] });
    });

    it('single output', () => {
      const s = P('PRINT 123');
      expect(s.list.length).to.equal(1);
      expect(s.list[0][1]).to.be.undefined;
    });

    it('single output without grouping', () => {
      const s = P('PRINT 123;');
      expect(s.list.length).to.equal(1);
      expect(s.list[0][1]).to.equal(TokenType.SEMICOLON);
    });

    it('multiple outputs', () => {
      const s = P('PRINT 123, 234; 345');
      const res = s.list.map(o => o[1]);
      expect(res).to.deep.equal([
        TokenType.COMMA,
        TokenType.SEMICOLON,
        undefined,
      ]);
    });

    it('with channel', () => {
      const s = P('PRINT #5, 123');
      expect(s.channel).to.deep.equal({
        type: ExprType.CONST,
        valueType: ValueType.INT,
        value: 5,
      });
    });
  });

  describe('IF as statement modifier', () => {
    it('handle basic case', () => {
      const s = P('PRINT "ok" IF 2 > 1');
      expect(s.type).to.equal(StatementType.IF);
      expect(s.thenStatements.length).to.equal(1);
      expect(s.thenStatements[0].type).to.equal(StatementType.PRINT);
    });
  });
});
