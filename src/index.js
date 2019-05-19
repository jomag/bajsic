import fs from "fs";
import { tokenizeLine, LexicalError } from "./lex";
import { parse, SyntaxError } from "./parse";

function precompile(code) {
  const lines = code.split("\n");
  let statements;
  let tokenizedLines;

  try {
    tokenizedLines = lines.map((line, i) => tokenizeLine(lines[i], i));
  } catch (e) {
    if (e instanceof LexicalError) {
      console.error(`${e.line}:${e.column}: Lexical error: ${e.message}`);
      process.exit(1);
    }
    throw e;
  }

  try {
    statements = parse(tokenizedLines);
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error(`${e.line}: Syntax error: ${e.message}`);
      console.error(`    ${e.code}`);
      process.exit(1);
    }
    throw e;
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
