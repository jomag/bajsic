import { TokenType } from '../lex';

export const expectLineLength = (tokens, length) => {
  if (tokens.length > length) {
    throw new SyntaxError(
      `Expected end of line. Got token ${tokens[length].type}`
    );
  }
};

export const expectToken = (tok, type) => {
  const v = Array.isArray(type) ? type : [type];
  if (!v.includes(tok.type)) {
    throw new SyntaxError(
      `Expected token of type ${v.join(' or ')}, got "${tok.type}"`
    );
  }
};

export const popType = (tokens, type) => {
  const tok = tokens.shift();

  if (!tok) {
    const exp = (Array.isArray(type) ? type : [type]).join(' or ');
    throw new SyntaxError(`Expected ${exp} at end of line`);
  }

  expectToken(tok, type);
  return tok;
};

export const expectKeyword = (tok, keyword) => {
  const kws = Array.isArray(keyword) ? keyword : [keyword];

  if (tok.type !== TokenType.KEYWORD) {
    throw new SyntaxError(`Expected ${kws.join(' or ')}, got "${tok.type}"`);
  }

  if (!kws.includes(tok.value)) {
    throw new SyntaxError(`Expected ${kws.join(' or ')}, got ${tok.value}`);
  }
};

export const popKeyword = (tokens, keyword) => {
  const kws = Array.isArray(keyword) ? keyword : [keyword];
  const tok = tokens.shift();

  if (!tok) {
    throw new SyntaxError(`Expected ${kws.join(' or ')} at end of line`);
  }

  expectKeyword(tok, keyword);
  return tok;
};

export const expectIdentifier = tok => {
  if (tok.type !== TokenType.IDENTIFIER) {
    throw new SyntaxError(`Expected identifier, got ${tok.type}`);
  }
};
