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

export const popOptionalType = (tokens, types) => {
  const tok = tokens[0];

  if (tok) {
    const list = Array.isArray(types) ? types : [types];
    if (list.includes(tok.type)) {
      return tokens.shift();
    }
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

export const isKeyword = (tok, keyword) =>
  tok.type === TokenType.KEYWORD && tok.value === keyword;

export const expectKeyword = (tok, keyword) => {
  const kws = Array.isArray(keyword) ? keyword : [keyword];

  if (tok.type !== TokenType.KEYWORD) {
    throw new SyntaxError(`Expected ${kws.join(' or ')}, got "${tok.type}"`);
  }

  if (!kws.includes(tok.value)) {
    throw new SyntaxError(`Expected ${kws.join(' or ')}, got ${tok.value}`);
  }
};

export const expectType = (token, types) => {
  const list = Array.isArray(types) ? types : [types];
  if (list.indexOf(token.type) < 0) {
    throw new SyntaxError(
      `Expected token with type ${list.join(' or ')}, got ${token.type}`
    );
  }
};

export const popOptionalKeyword = (tokens, keywords) => {
  const list = Array.isArray(keywords) ? keywords : [keywords];
  const tok = tokens[0];

  if (tok && tok.type === TokenType.KEYWORD) {
    if (list.includes(tok.value)) {
      return tokens.shift();
    }
  }
};

export const popOptionalDataType = tokens => {
  const tok = tokens[0];
  if (tok && tok.type === TokenType.DATA_TYPE) {
    return tokens.shift();
  }
};

export const popOptionalIdentifier = tokens => {
  const tok = tokens[0];
  if (tok && tok.type === TokenType.IDENTIFIER) {
    return tokens.shift();
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

export const popIdentifier = tokens => {
  const tok = tokens.shift();
  if (tok.type !== TokenType.IDENTIFIER) {
    throw new SyntaxError(`Expected identifier token, found ${tok.type}`);
  }
  return tok.value;
};
