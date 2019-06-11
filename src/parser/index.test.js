const chai = require('chai');
const expect = chai.expect;

import { StatementType, parse, parseExpression } from './';
import { tokenize, TokenType } from '../lex';

const T = text => tokenize(text);
const P = text => parse(T(text));

const tokenToString = tok => {
  switch (tok.type) {
    case TokenType.INT:
      return tok.value.toString();
    default:
      return tok.type;
  }
};

describe('Syntactical Analyzer', () => {
  describe('parseExpression()', () => {
    it('parses single number', () => {
      const expr = parseExpression(T('31482'));
      const abbrev = expr.map(tokenToString);
      expect(abbrev).to.deep.equal(['31482']);
    });

    it('parses a + b', () => {
      const tokens = T('100 + 242');
      console.log('TOKENS: ', tokens);
      const expr = parseExpression(T('100 + 242'));
      const abbrev = expr.map(tokenToString);
      expect(abbrev).to.deep.equal(['100', '242', TokenType.PLUS]);
    });
  });

  describe('LIST', () => {
    it('without lines', () => {
      const s = P('LIST');
      expect(s.type).to.equal(StatementType.LIST);
      expect(s.data).to.deep.equal([]);
    });

    it('with single line', () => {
      const s = P('LIST 10');
      expect(s.data).to.deep.equal([[10, 10]]);
    });

    it('with single range', () => {
      const s = P('LIST 20-30');
      expect(s.data).to.deep.equal([[20, 30]]);
    });

    it('with multiple lines and ranges', () => {
      const s = P('LIST 10,20-30,40,50-60');
      expect(s.data).to.deep.equal([[10, 10], [20, 30], [40, 40], [50, 60]]);
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
      expect(s.data.list.length).to.equal(1);
      expect(s.data.list[0][1]).to.be.true;
    });

    it('single output without linebreak', () => {
      const s = P('PRINT 123;');
      expect(s.data.list.length).to.equal(1);
      expect(s.data.list[0][1]).to.be.false;
    });

    it('multiple outputs', () => {
      const s = P('PRINT 123, 234; 345');
      const res = s.data.list.map(o => o[1]);
      expect(res).to.deep.equal([true, false, true]);
    });

    it('with channel', () => {
      const s = P('PRINT #5, 123');
      // expect(s.data.channel).to.deep.equal([{ type: TokenType.INT, value: 5 }]);
    });
  });
});
