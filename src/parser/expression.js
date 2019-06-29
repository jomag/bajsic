import { TokenType } from '../lex';
import { ExprType, ConstExpr, AddExpr, ValueType } from '../expr';

// Operator associativity (left/right)
const assoc = {
  [TokenType.MUL]: 'L',
  [TokenType.DIV]: 'L',
  [TokenType.PLUS]: 'L',
  [TokenType.MINUS]: 'L'
};

// Operator precedence
const prec = {
  [TokenType.MUL]: 1,
  [TokenType.DIV]: 1,
  [TokenType.PLUS]: 0,
  [TokenType.MINUS]: 0
};

function assert(cond, message) {
  if (!cond) {
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

const operators = [TokenType.INT, TokenType.STRING];

const peek = tokens => tokens[tokens.length - 1];
const isOperand = tokenType => operators.indexOf(tokenType) >= 0;
const isOperator = tokenType => !isOperand(tokenType); // fixme: not quite true

const buildOperandExpression = token => {
  switch (token.type) {
    case TokenType.INT:
      return new ConstExpr(ValueType.INT, token.value);
    case TokenType.STRING:
      return new ConstExpr(ValueType.STRING, token.value);
    default:
      throw new Error(
        `Internal error: can't build operand expression from token: ${token}`
      );
  }
};

const buildBinaryOperatorExpr = (token, child1, child2) => {
  return new AddExpr(child1, child2);
};

// Some hints:
// https://www.klittlepage.com/2013/12/22/twelve-days-2013-shunting-yard-algorithm/
export const parseExpression = tokens => {
  const operatorStack = [];
  const exprStack = [];

  while (tokens.length > 0) {
    const tok = tokens[0];

    // Left paranthesis (opening)
    if (tok.type === TokenType.LPAR) {
      operatorStack.push(tok);
    }

    // Operand
    else if (isOperand(tok.type)) {
      exprStack.push(buildOperandExpression(tok));
    }

    // Operator
    else if (isOperator(tok.type)) {
      while (operatorStack.length > 0) {
        const o = peek(operatorStack);

        const c1 = prec[o.type] > prec[tok.type];
        const c2 = prec[o.type] === prec[tok.type] && assoc[o.type] === 'L';

        if ((c1 || c2) && o.type !== TokenType.LPAR) {
          const operator = operatorStack.pop();
          const op2 = exprStack.pop();
          const op1 = exprStack.pop();
          exprStack.push(buildBinaryOperatorExpr(operator, op1, op2));
        } else {
          break;
        }
      }

      operatorStack.push(tok);
    }

    // Right paranthesis (closing)
    else if (tok.type === TokenType.RPAR) {
      while (peek(operatorStack).type !== TokenType.LPAR) {
        const operator = operatorStack.pop();
        const op2 = exprStack.pop();
        const op1 = exprStack.pop();
        exprStack.push(buildBinaryOperatorExpr(operator, op1, op2));
      }

      if (peek(operatorStack).type !== TokenType.LPAR) {
        throw new SyntaxError('Mismatched paranthesis in expression');
      }

      operatorStack.pop();
    }

    tokens.shift();
  }

  while (operatorStack.length > 0) {
    const operator = operatorStack.pop();
    const op2 = exprStack.pop();
    const op1 = exprStack.pop();
    exprStack.push(buildBinaryOperatorExpr(operator, op1, op2));
  }

  assert(operatorStack.length === 0, 'Operator exprStack not empty');
  assert(exprStack.length === 1, 'Expression stack has not length 1');
  return exprStack.pop();
};
