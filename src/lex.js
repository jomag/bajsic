export const TokenType = {
  COLON: 'colon',
  COMMA: 'comma',
  COMMENT: 'comment',
  DIV: 'div',
  EQ: 'eq',
  APPROX_EQ: 'approx_eq',
  NE: 'ne',
  FLOAT: 'float',
  GE: 'ge',
  GT: 'gt',
  HASH: 'hash',
  IDENTIFIER: 'identifier',
  INT: 'int',
  KEYWORD: 'keyword',
  DATA_TYPE: 'dataType',
  LPAR: 'lpar',
  LE: 'le',
  LT: 'lt',
  MINUS: 'minus',
  MUL: 'mul',
  PLUS: 'plus',
  REMARK: 'remark',
  RPAR: 'rpar',
  SEMICOLON: 'semicolon',
  SEPARATOR: 'SEPARATOR',
  STRING: 'string',
  NOT: 'not',
  AND: 'and',
  OR: 'or',
  XOR: 'xor',
  NOT: 'not',

  // FIXME: I'm not sure about the meaning of underscore
  //        It's often found in INPUT statements:
  //        10 INPUT ""_A$
  UNDERSCORE: 'underscore',
};

export const Keyword = {
  DIM: 'DIM',
  GOTO: 'GOTO',
  IF: 'IF',
  THEN: 'THEN',
  ELSE: 'ELSE',
  PRINT: 'PRINT',
  RETURN: 'RETURN',
  RUN: 'RUN',
  GOSUB: 'GOSUB',
  LIST: 'LIST',
  END: 'END',
  LET: 'LET',
  ON: 'ON',
  OTHERWISE: 'OTHERWISE',
  FOR: 'FOR',
  TO: 'TO',
  NEXT: 'NEXT',
  INPUT: 'input',
  CLOSE: 'close',
  LINE: 'line',
  OPEN: 'open',
  OUTPUT: 'output',
  AS: 'as',
  FILE: 'file',
  RESUME: 'resume',
  MARGIN: 'margin',
  QUOTE: 'quote',
  STOP: 'stop',
  READ: 'read',
  DATA: 'data',
  DEF: 'def',
  PROGRAM: 'program',
  FUNCTION: 'function',
  FNEND: 'fnend',
  CHANGE: 'change',
  WRITE: 'write',
  DEBUG: 'debug',
};

const DataType = {
  BYTE: 'byte',
  WORD: 'word',
  LONG: 'long',
  SINGLE: 'single',
  DOUBLE: 'double',
  STRING: 'string',
  RFA: 'rfa',
};

const keywordAliases = {
  DIMENSION: Keyword.DIM,
};

export class Token {
  constructor(type, value) {
    if (!type) {
      throw new Error(`Internal error: create token with type: ${type}`);
    }
    this.type = type;
    this.value = value;
  }
}

export class LexicalError extends Error {
  constructor(message, column, ...params) {
    super(...params);
    this.message = message;
    this.column = column;
  }
}

export const tokenize = (source, sourceLineNo) => {
  const space = ' \t';
  const numeric = '0123456789';
  const lowerAlpha = 'abcdefghijklmnopqrstuvwxyz';
  const alpha = lowerAlpha + lowerAlpha.toUpperCase();
  const alphaNumeric = alpha + numeric;
  const remarkChar = "'";
  const nameCharacters = alphaNumeric + '$%';
  const tokens = [];
  const twoCharacterToken = {
    ['<>']: TokenType.NE,
    ['<=']: TokenType.LE,
    ['>=']: TokenType.GE,
    ['==']: TokenType.APPROX_EQ,
  };
  const singleCharacterToken = {
    [',']: TokenType.COMMA,
    ['(']: TokenType.LPAR,
    [')']: TokenType.RPAR,
    ['\\']: TokenType.SEPARATOR,
    ['<']: TokenType.LT,
    ['=']: TokenType.EQ,
    ['>']: TokenType.GT,
    ['+']: TokenType.PLUS,
    ['-']: TokenType.MINUS,
    ['*']: TokenType.MUL,
    ['/']: TokenType.DIV,
    [':']: TokenType.COLON,
    [';']: TokenType.SEMICOLON,
    ['_']: TokenType.UNDERSCORE,
    ['#']: TokenType.HASH,
  };
  let i = 0;

  const skipSpace = () => {
    while (i < source.length && space.includes(source[i])) i++;
  };

  const parseNumber = () => {
    let type = TokenType.INT;
    const j = i;

    while (numeric.includes(source[i])) i++;

    if (source[i] === '.') {
      type = TokenType.FLOAT;
      i++;
      while (numeric.includes(source[i])) i++;
    }

    const sub = source.substring(j, i);

    if (source[i] === '%') {
      type = TokenType.INT;
      i++;
    }

    const value = type === TokenType.INT ? parseInt(sub) : parseFloat(sub);
    return { type, value };
  };

  const parseRemark = () => {
    i++;
    skipSpace();
    const j = i;
    i = source.length;
    return new Token(TokenType.REMARK, source.substring(j, i));
  };

  const parseWord = () => {
    const j = i++;
    while (i < source.length && nameCharacters.includes(source[i])) i++;
    const value = source.substring(j, i);

    const word = value.toUpperCase();

    // Special handling of the REM keyword
    if (word === 'REM') {
      return parseRemark();
    }

    // Special handling of a few operators, that arguable are keywords,
    // but have specific token types.
    switch (word) {
      case 'AND':
        return new Token(TokenType.AND);
      case 'OR':
        return new Token(TokenType.OR);
      case 'NOT':
        return new Token(TokenType.NOT);
      case 'XOR':
        return new Token(TokenType.XOR);
    }

    if (Object.keys(keywordAliases).includes(word)) {
      return new Token(TokenType.KEYWORD, keywordAliases[word]);
    }

    if (Object.keys(Keyword).includes(word)) {
      return new Token(TokenType.KEYWORD, Keyword[word]);
    }

    if (Object.keys(DataType).includes(word)) {
      return new Token(TokenType.DATA_TYPE, DataType[word]);
    }

    return new Token(TokenType.IDENTIFIER, value);
  };

  const parseString = () => {
    const j = ++i;
    while (i < source.length && source[i] !== '"') i++;

    if (source[i] !== '"') {
      throw new LexicalError('Missing terminating " character', i);
    }

    const value = source.substring(j, i++);
    return new Token(TokenType.STRING, value);
  };

  while (i < source.length) {
    skipSpace();

    if (i < source.length) {
      const c = source[i];

      if (numeric.includes(c)) {
        tokens.push(parseNumber());
        continue;
      }

      if (remarkChar.includes(c)) {
        tokens.push(parseRemark());
        continue;
      }

      if (alpha.includes(c)) {
        tokens.push(parseWord());
        continue;
      }

      if (c === '"') {
        tokens.push(parseString());
        continue;
      }

      if (i + 1 < source.length) {
        const cc = source.slice(i, i + 2);
        if (Object.keys(twoCharacterToken).includes(cc)) {
          tokens.push(new Token(twoCharacterToken[cc]));
          i += 2;
          continue;
        }
      }

      if (Object.keys(singleCharacterToken).includes(c)) {
        tokens.push(new Token(singleCharacterToken[c]));
        i++;
        continue;
      }

      throw new LexicalError(`Invalid character '${c}'`, i);
    }
  }

  return tokens;
};
