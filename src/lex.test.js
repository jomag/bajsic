import { expect } from 'chai';
import { tokenize, TokenType, Keyword } from './lex';
import { LexicalError } from './error';

describe('Lexical Analyzer', () => {
  it('handles empty lines', () => {
    expect(tokenize('')).to.be.empty;
  });

  it('handles whitespace', () => {
    expect(tokenize('    ')).to.be.empty;
  });

  it('handles integers', () => {
    const line = '1 25% 13542';
    expect(tokenize(line)).to.deep.equal([
      { type: TokenType.INT, value: 1 },
      { type: TokenType.INT, value: 25 },
      { type: TokenType.INT, value: 13542 },
    ]);
  });

  it('handles floats', () => {
    const line = '1.0 3.14';
    expect(tokenize(line)).to.deep.equal([
      { type: TokenType.FLOAT, value: 1 },
      { type: TokenType.FLOAT, value: 3.14 },
    ]);
  });

  it('handles remark', () => {
    const line = '5000 REM This is a comment';
    const result = tokenize(line);
    expect(result).to.deep.equal([
      { type: TokenType.INT, value: 5000 },
      { type: TokenType.REMARK, value: 'This is a comment' },
    ]);
  });

  it('handles shortened remark', () => {
    const line = "5000 ' This is a comment";
    const result = tokenize(line);
    expect(result).to.deep.equal([
      { type: TokenType.INT, value: 5000 },
      { type: TokenType.REMARK, value: 'This is a comment' },
    ]);
  });

  it('handles identifiers', () => {
    const line = 'a Ab ab123  ';
    const result = tokenize(line);
    expect(result).to.deep.equal([
      { type: TokenType.IDENTIFIER, value: 'a' },
      { type: TokenType.IDENTIFIER, value: 'Ab' },
      { type: TokenType.IDENTIFIER, value: 'ab123' },
    ]);
  });

  it('handles keywords', () => {
    const line = '42 dim foo dimension';
    const result = tokenize(line);
    expect(result).to.deep.equal([
      { type: TokenType.INT, value: 42 },
      { type: TokenType.KEYWORD, value: Keyword.DIM },
      { type: TokenType.IDENTIFIER, value: 'foo' },
      { type: TokenType.KEYWORD, value: Keyword.DIM },
    ]);
  });

  it('handles single character tokens', () => {
    const line = '( ) , \\ < > =';
    const result = tokenize(line);
    expect(result.map(t => t.type)).to.deep.equal([
      TokenType.LPAR,
      TokenType.RPAR,
      TokenType.COMMA,
      TokenType.SEPARATOR,
      TokenType.LT,
      TokenType.GT,
      TokenType.EQ,
    ]);
  });

  it('handles two-character tokens', () => {
    const line = '<><=>=';
    const result = tokenize(line);
    expect(result.map(t => t.type)).to.deep.equal([
      TokenType.NE,
      TokenType.LE,
      TokenType.GE,
    ]);
  });

  it('handles strings', () => {
    const line = '3000 "" "+" "hello there"';
    const result = tokenize(line);
    expect(result).to.deep.equal([
      { type: TokenType.INT, value: 3000 },
      { type: TokenType.STRING, value: '' },
      { type: TokenType.STRING, value: '+' },
      { type: TokenType.STRING, value: 'hello there' },
    ]);
  });

  it('catches incomplete strings', () => {
    const line = '3000 "hello there';
    expect(() => tokenize(line)).to.throw(LexicalError);
  });
});
