import { Expression } from '../expr';
import { TokenType } from '../lex';

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

const peek = tokens => tokens[tokens.length - 1];
const isOperand = tokenType => tokenType === TokenType.INT;
const isOperator = tokenType => tokenType !== TokenType.INT; // fixme: not quite true

export const parseExpression = tokens => {
  const expr = new Expression();
  const result = [];
  const operatorStack = [];

  while (tokens.length > 0) {
    const tok = tokens[0];

    if (isOperand(tok.type)) {
      result.push(tok);
    }

    if (isOperator(tok.type)) {
      while (operatorStack.length > 0) {
        o = peek(operatorStack);

        while (true) {
          const c1 = prec[o.type] > prec[tok.type];
          const c2 = prec[o.type] === prec[tok.type] && assoc[o.type] === 'L';

          if ((c1 || c2) && o.type !== TokenType.LPAR) {
            result.push(operatorStack.pop());
          } else {
            break;
          }
        }
      }
      
      operatorStack.push(tok);
    }

    if (tok.type === TokenType.LPAR) {
      operatorStack.push(tok);
    }

    if (tok.type === TokenType.RPAR) {
      while (peek(operatorStack).type !== TokenType.LPAR) {
        result.push(operatorStack.pop());
      }

      if (peek(operatorStack).type !== TokenType.LPAR) {
        throw new SyntaxError('Mismatched paranthesis in expression');
      }

      operatorStack.pop();
    }

    tokens.shift();
  }

  while (operatorStack.length > 0) {
    result.push(operatorStack.pop());
  }

  return result;
};
