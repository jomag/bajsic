import fs from "fs";
import { tokenizeLine, LexicalError } from "./tokenizer";

function precompile(code) {
  const lines = code.split("\n");
  const statements = [];

  try {
    const tokenizedLines = lines.map((line, i) => tokenizeLine(lines[i], i));
    return tokenizedLines;
  } catch (e) {
    if (e instanceof LexicalError) {
      console.error(`${e.line}:${e.column}: Lexical error: ${e.message}`);
      process.exit(1);
    }
  }
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

const source = fs.readFileSync("stuga.bas", "utf8");
const precompiled = precompile(source);
// run(precompiled);
