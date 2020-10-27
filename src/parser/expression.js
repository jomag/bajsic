import { TokenType } from '../lex';
import {
  AddExpr,
  AndExpr,
  OrExpr,
  CallExpr,
  ConstExpr,
  IdentifierExpr,
  MultiplyExpr,
  RelationalOperatorExpr,
  ExprType,
  SubtractExpr,
  DivideExpr,
  NotExpr,
  UnaryMinusExpr,
} from '../expr';

import { ValueType } from '../Value';
import { SyntaxError } from '../error';

const Operator = {
  EXP: 'EXP',
  UMINUS: 'UMINUS',
  UPLUS: 'UPLUS',
  MUL: 'MUL',
  DIV: 'DIV',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  CONCAT: 'CONCAT',
  NOT: 'NOT',
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',
  IMP: 'IMP',
  EQV: 'EQV',
  EQ: 'EQ',
  GE: 'GE',
  GT: 'GT',
  LE: 'LE',
  LT: 'LT',
  NE: 'NE',
  STREQ: 'STREQ',

  LPAR: 'LPAR',
  RPAR: 'RPAR',
  SEPARATOR: 'SEPARATOR',
  CALL: 'CALL',
};

// Operator associativity (left/right)
const assoc = {
  [Operator.MUL]: 'L',
  [Operator.DIV]: 'L',
  [Operator.PLUS]: 'L',
  [Operator.MINUS]: 'L',
  [Operator.LE]: 'L',
  [Operator.LT]: 'L',
  [Operator.GE]: 'L',
  [Operator.GT]: 'L',
  [Operator.EQ]: 'L',
  [Operator.NE]: 'L',
  [Operator.AND]: 'L',
  [Operator.OR]: 'L',
  [Operator.XOR]: 'L',
};

const token2operator = {
  [TokenType.MUL]: Operator.MUL,
  [TokenType.DIV]: Operator.DIV,
  [TokenType.PLUS]: Operator.PLUS,
  [TokenType.MINUS]: Operator.MINUS,

  [TokenType.EQ]: Operator.EQ,
  [TokenType.GE]: Operator.GE,
  [TokenType.GT]: Operator.GT,
  [TokenType.LE]: Operator.LE,
  [TokenType.LT]: Operator.LT,
  [TokenType.NE]: Operator.NE,

  [TokenType.NOT]: Operator.NOT,
  [TokenType.AND]: Operator.AND,
  [TokenType.OR]: Operator.OR,
  [TokenType.XOR]: Operator.XOR,

  [TokenType.LPAR]: Operator.LPAR,
  [TokenType.RPAR]: Operator.RPAR,
  [TokenType.COMMA]: Operator.SEPARATOR,
};

const unaryOperators = [Operator.NOT, Operator.UMINUS];

// Operator precedence
// Reference: VAX Basic Reference, table 1-15 (p. 1-51)
const prec = {
  [Operator.EXP]: 1,

  [Operator.UMINUS]: 2,
  [Operator.UPLUS]: 2,

  [Operator.MUL]: 3,
  [Operator.DIV]: 3,

  [Operator.PLUS]: 4,
  [Operator.MINUS]: 4,

  [Operator.CONCAT]: 5,

  // FIXME: all relational operators, precedence: 6
  [Operator.EQ]: 6,
  [Operator.GE]: 6,
  [Operator.GT]: 6,
  [Operator.LE]: 6,
  [Operator.LT]: 6,
  [Operator.NE]: 6,
  [Operator.STREQ]: 6,

  [Operator.NOT]: 7,
  [Operator.AND]: 8,
  [Operator.OR]: 9,
  [Operator.XOR]: 9,
  [Operator.IMP]: 10,
  [Operator.EQV]: 11,
};

const assert = (cond, message, obj) => {
  if (!cond) {
    const msg = obj ? `${message} (${JSON.stringify(obj, null, 2)})` : message;
    throw new SyntaxError(msg);
  }
};

const operands = [
  TokenType.INT,
  TokenType.FLOAT,
  TokenType.STRING,
  TokenType.IDENTIFIER,
];

const peek = tokens => tokens[tokens.length - 1];
const isOperand = tokenType => operands.indexOf(tokenType) >= 0;
const isUnary = op => unaryOperators.includes(op);

const buildOperandExpression = token => {
  switch (token.type) {
    case TokenType.INT:
      return new ConstExpr(ValueType.INT, token.value);
    case TokenType.FLOAT:
      return new ConstExpr(ValueType.FLOAT, token.value);
    case TokenType.STRING:
      return new ConstExpr(ValueType.STRING, token.value);
    case TokenType.IDENTIFIER:
      return new IdentifierExpr(token.value);
    default:
      throw new Error(
        `Internal error: can't build operand expression from token: ${token}`
      );
  }
};

const buildBinaryOperatorExpr = (operator, child1, child2) => {
  const relOpMap = {
    [Operator.LT]: ExprType.LT,
    [Operator.LE]: ExprType.LE,
    [Operator.GT]: ExprType.GT,
    [Operator.GE]: ExprType.GE,
    [Operator.EQ]: ExprType.EQ,
    [Operator.NE]: ExprType.NE,
  };

  if (Object.keys(relOpMap).indexOf(operator) >= 0) {
    const exprType = relOpMap[operator];
    return new RelationalOperatorExpr(exprType, child1, child2);
  }

  switch (operator) {
    case Operator.PLUS:
      return new AddExpr(child1, child2);
    case Operator.MINUS:
      return new SubtractExpr(child1, child2);
    case Operator.MUL:
      return new MultiplyExpr(child1, child2);
    case Operator.DIV:
      return new DivideExpr(child1, child2);
    case Operator.AND:
      return new AndExpr(child1, child2);
    case Operator.OR:
      return new OrExpr(child1, child2);
    default:
      throw new Error(
        `Internal error: can't build binary operator of type: ${operator}`
      );
  }
};

const buildUnaryOperatorExpr = (operator, operand) => {
  switch (operator) {
    case Operator.NOT:
      return new NotExpr(operand);
    case Operator.UMINUS:
      return new UnaryMinusExpr(operand);
    default:
      throw new Error(
        `Internal error: can't build unary operator of type: ${operator}`
      );
  }
};

// Some hints:
// https://www.klittlepage.com/2013/12/22/twelve-days-2013-shunting-yard-algorithm/
export const parseOptionalExpression = tokens => {
  const operatorStack = [];
  const exprStack = [];
  const argCountStack = [];
  const emptyBracketStack = [];

  let possibleFunctionCall = false;

  const notOpenBracket = () => {
    if (operatorStack.length) {
      const item = peek(operatorStack);
      return item !== Operator.LPAR && item !== Operator.CALL;
    }
  };

  const setNotEmptyBracket = () => {
    if (peek(emptyBracketStack) === true) {
      emptyBracketStack.pop();
      emptyBracketStack.push(false);
    }
  };

  const buildExpr = operator => {
    if (isUnary(operator)) {
      const operand = exprStack.pop();
      exprStack.push(buildUnaryOperatorExpr(operator, operand));
    } else {
      const op2 = exprStack.pop();
      const op1 = exprStack.pop();
      exprStack.push(buildBinaryOperatorExpr(operator, op1, op2));
    }
  };

  while (tokens.length > 0) {
    const tok = tokens[0];
    let op = token2operator[tok.type];

    if (op === Operator.MINUS && !possibleFunctionCall) {
      op = Operator.UMINUS;
    }

    // Determine end of expression
    if (op === Operator.SEPARATOR && argCountStack.length === 0) {
      break;
    }

    // Operand
    if (op === undefined) {
      if (isOperand(tok.type)) {
        exprStack.push(buildOperandExpression(tok));
        setNotEmptyBracket();
        possibleFunctionCall = true;
      } else {
        // Unknown token -> end of expression
        break;
      }
    }

    // Left paranthesis (opening)
    else if (op === Operator.LPAR) {
      emptyBracketStack.push(true);
      if (possibleFunctionCall) {
        operatorStack.push(Operator.CALL);
        argCountStack.push(0);
      } else {
        operatorStack.push(op);
      }
      possibleFunctionCall = false;
    }

    // Right paranthesis (closing)
    else if (op === Operator.RPAR) {
      const empty = emptyBracketStack.pop();

      while (notOpenBracket()) {
        buildExpr(operatorStack.pop());
      }

      if (!operatorStack.length) {
        // No matching left paranthesis in expression
        // The closing paranthesis is likely part of the
        // outer statement, so assume we've reached the end
        // of the expression.
        break;
      }

      if (peek(operatorStack) === Operator.CALL) {
        let argCount = argCountStack.pop() + (empty ? 0 : 1);
        let args = [];
        while (argCount > 0) {
          args = [...args, exprStack.pop()];
          argCount--;
        }
        const fun = exprStack.pop();
        const call = new CallExpr(fun, args.reverse());
        exprStack.push(call);
      }

      possibleFunctionCall = true;
      operatorStack.pop();
    }

    // Expression separator, typically for functions
    else if (op === Operator.SEPARATOR) {
      while (notOpenBracket()) {
        buildExpr(operatorStack.pop());
      }

      argCountStack.push(argCountStack.pop() + 1);
      possibleFunctionCall = false;
    }

    // Only binary operators remaining
    else {
      while (operatorStack.length > 0) {
        const o = peek(operatorStack);

        const c1 = prec[o] < prec[op];
        const c2 = prec[o] === prec[op] && assoc[o] === 'L';

        if ((c1 || c2) && o !== TokenType.LPAR) {
          buildExpr(operatorStack.pop());
        } else {
          break;
        }
      }

      possibleFunctionCall = false;
      operatorStack.push(op);
    }

    tokens.shift();
  }

  while (operatorStack.length > 0) {
    buildExpr(operatorStack.pop());
  }

  assert(
    operatorStack.length === 0,
    'Operator exprStack not empty',
    operatorStack
  );

  return exprStack.pop();
};

export const parseExpression = tokens => {
  const expr = parseOptionalExpression(tokens);
  if (!expr) {
    throw new SyntaxError('Empty expression');
  }
  return expr;
};
