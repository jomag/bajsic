import { TokenType } from '../lex';
import { Enum } from '../utils';
import {
  AddExpr,
  CallExpr,
  ConstExpr,
  IdentifierExpr,
  MultiplyExpr,
  ValueType
} from '../expr';

const Operator = Enum([
  'EXP',
  'UMINUS',
  'UPLUS',
  'MUL',
  'DIV',
  'PLUS',
  'MINUS',
  'CONCAT',
  'NOT',
  'AND',
  'OR',
  'XOR',
  'IMP',
  'EQV',
  'EQ',
  'GE',
  'GT',
  'LE',
  'LT',
  'NE',
  'STREQ',

  'LPAR',
  'RPAR',
  'SEPARATOR',
  'CALL'
]);

// Operator associativity (left/right)
const assoc = {
  [Operator.MUL]: 'L',
  [Operator.DIV]: 'L',
  [Operator.PLUS]: 'L',
  [Operator.MINUS]: 'L'
};

const token2operator = {
  [TokenType.MUL]: Operator.MUL,
  [TokenType.DIV]: Operator.DIV,
  [TokenType.PLUS]: Operator.PLUS,
  [TokenType.MINUS]: Operator.MINUS,

  [TokenType.LPAR]: Operator.LPAR,
  [TokenType.RPAR]: Operator.RPAR,
  [TokenType.COMMA]: Operator.SEPARATOR
};

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
  [Operator.EQV]: 11
};

function assert(cond, message, obj) {
  if (!cond) {
    const msg = obj ? `${message} (${JSON.stringify(obj, null, 2)})` : message;
    throw new SyntaxError(msg);
  }
}

const operands = [TokenType.INT, TokenType.STRING, TokenType.IDENTIFIER];
const binaryOperators = [
  TokenType.PLUS,
  TokenType.MINUS,
  TokenType.MUL,
  TokenType.DIV
];

const peek = tokens => tokens[tokens.length - 1];
const isOperand = tokenType => operands.indexOf(tokenType) >= 0;

const buildOperandExpression = token => {
  switch (token.type) {
    case TokenType.INT:
      return new ConstExpr(ValueType.INT, token.value);
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

const buildOperatorExpr = (operator, child1, child2) => {
  switch (operator) {
    case Operator.PLUS:
      return new AddExpr(child1, child2);
    case Operator.MUL:
      return new MultiplyExpr(child1, child2);
    default:
      throw new Error(
        `Internal error: can't build binary operator from token: ${JSON.stringify(
          token
        )}`
      );
  }
};

// Some hints:
// https://www.klittlepage.com/2013/12/22/twelve-days-2013-shunting-yard-algorithm/
export const parseExpression = tokens => {
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

  // for (let tok of tokens) {
  //    console.log("Token: ", tok)
  //  }

  while (tokens.length > 0) {
    const tok = tokens[0];

    const op = token2operator[tok.type];

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
        const operator = operatorStack.pop();
        const op2 = exprStack.pop();
        const op1 = exprStack.pop();
        exprStack.push(buildOperatorExpr(operator, op1, op2));
      }

      if (!operatorStack.length) {
        throw new SyntaxError('Mismatched paranthesis in expression');
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
        argCountStack.pop();
      }

      possibleFunctionCall = true;
      operatorStack.pop();
    }

    // Expression separator, typically for functions
    else if (op === Operator.SEPARATOR) {
      while (notOpenBracket()) {
        const operator = operatorStack.pop();
        const op2 = exprStack.pop();
        const op1 = exprStack.pop();
        exprStack.push(buildOperatorExpr(operator, op1, op2));
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
          const operator = operatorStack.pop();
          const op2 = exprStack.pop();
          const op1 = exprStack.pop();
          exprStack.push(buildOperatorExpr(operator, op1, op2));
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
    const operator = operatorStack.pop();
    const op2 = exprStack.pop();
    const op1 = exprStack.pop();
    exprStack.push(buildOperatorExpr(operator, op1, op2));
  }

  assert(
    operatorStack.length === 0,
    'Operator exprStack not empty',
    operatorStack
  );

  assert(
    exprStack.length === 1,
    `Expression stack has length ${exprStack.length}, expected 1`,
    exprStack
  );

  return exprStack.pop();
};
