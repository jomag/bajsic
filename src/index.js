const fs = require('fs');

function precompile(code) {
  return [{ type: "print", expr: "hello" }, { type: "goto", expr: 0}];
}

function evaluate(expr, state) {
  return expr;
}

function execute_statement(statement, state) {
  switch (statement.type) {
    case "print":
      console.log(evaluate(statement.expr, state));
      state.pc = state.pc + 1;
      break;

    case "goto":
      state.pc = evaluate(statement.expr);
  }
}

function run(program) {
  const state = { pc: 0 };
  while (true) {
    execute_statement(program[state.pc], state);
  }
}

const source = fs.readFileSync('stuga.bas', 'utf8');
console.log(source);

run(precompile(test_code));
