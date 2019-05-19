export const TokenType = {
  COMMENT: "comment",
  REMARK: "remark",
  INT: "int",
  FLOAT: "float",
  STRING: "string",
  IDENTIFIER: "identifier",
  KEYWORD: "keyword",
  LPAR: "lpar",
  RPAR: "rpar",
  COMMA: "comma",
  SEPARATOR: "separator",
  EQ: "eq",
  PLUS: "plus",
  MINUS: "minus",
  MUL: "mul",
  DIV: "div",
  GT: "gt",
  LT: "lt",
  COLON: "colon",
  SEMICOLON: "semicolon",
  HASH: "hash",

  // FIXME: I'm not sure about the meaning of underscore
  //        It's often find in INPUT statements:
  //        10 INPUT ""_A$
  UNDERSCORE: "underscore"
};

export const Keyword = {
  DIM: "DIM",
  GOTO: "GOTO"
};

const keywordAliases = {
  DIMENSION: Keyword.DIM
};

export class LexicalError extends Error {
  constructor(message, line, column, code, ...params) {
    super(...params);
    this.message = message;
    this.line = line;
    this.column = column;
    this.code = code;
  }
}

export const tokenizeLine = (line, lineNumber) => {
  const space = " \t";
  const numeric = "0123456789";
  const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
  const alpha = lowerAlpha + lowerAlpha.toUpperCase();
  const alphaNumeric = alpha + numeric;
  const remarkChar = "'";
  const nameCharacters = alphaNumeric + "$%";
  const tokens = [];
  const singleCharacterToken = {
    [","]: TokenType.COMMA,
    ["("]: TokenType.LPAR,
    [")"]: TokenType.RPAR,
    ["\\"]: TokenType.SEPARATOR,
    ["<"]: TokenType.LT,
    ["="]: TokenType.EQ,
    [">"]: TokenType.GT,
    ["+"]: TokenType.PLUS,
    ["-"]: TokenType.MINUS,
    ["*"]: TokenType.MUL,
    ["/"]: TokenType.DIV,
    [":"]: TokenType.COLON,
    [";"]: TokenType.SEMICOLON,
    ["_"]: TokenType.UNDERSCORE,
    ["#"]: TokenType.HASH
  };
  let i = 0;

  const skipSpace = () => {
    while (i < line.length && space.includes(line[i])) i++;
  };

  const parseNumber = () => {
    let type = TokenType.INT;
    const j = i;

    while (numeric.includes(line[i])) i++;

    if (line[i] === ".") {
      type = TokenType.FLOAT;
      i++;
      while (numeric.includes(line[i])) i++;
    }

    const sub = line.substring(j, i);

    if (line[i] === "%") {
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
    i = line.length;
    return {
      type: TokenType.REMARK,
      value: line.substring(j, i)
    };
  };

  const parseIdentifierOrKeyword = () => {
    const j = i++;
    while (i < line.length && nameCharacters.includes(line[i])) i++;
    const value = line.substring(j, i);

    // Special handling of the REM keyword
    if (value.toUpperCase() === "REM") {
      return parseRemark();
    }

    const keyword = value.toUpperCase();

    if (Object.keys(keywordAliases).includes(keyword)) {
      return {
        type: TokenType.KEYWORD,
        value: keywordAliases[keyword]
      };
    }

    if (Object.keys(Keyword).includes(keyword)) {
      return {
        type: TokenType.KEYWORD,
        value: Keyword[keyword]
      };
    }

    return {
      type: TokenType.IDENTIFIER,
      value
    };
  };

  const parseString = () => {
    const j = ++i;
    while (i < line.length && line[i] !== '"') i++;

    if (line[i] !== '"') {
      throw new LexicalError(
        'Missing terminating " character',
        lineNumber,
        i,
        line
      );
    }

    const value = line.substring(j, i++);
    return { type: TokenType.STRING, value };
  };

  while (i < line.length) {
    skipSpace();

    if (i < line.length) {
      const c = line[i];

      if (numeric.includes(c)) {
        tokens.push(parseNumber());
        continue;
      }

      if (remarkChar.includes(c)) {
        tokens.push(parseRemark());
        continue;
      }

      if (alpha.includes(c)) {
        tokens.push(parseIdentifierOrKeyword());
        continue;
      }

      if (c === '"') {
        tokens.push(parseString());
        continue;
      }

      if (Object.keys(singleCharacterToken).includes(c)) {
        tokens.push({
          type: singleCharacterToken[c]
        });
        i++;
        continue;
      }

      throw new LexicalError(`Invalid character '${c}'`, lineNumber, i, line);
    }
  }

  return {
    lineNumber,
    line,
    tokens
  };
};
