/* eslint-disable no-param-reassign */
// @ts-check

// @ts-ignore
// import readline from 'readline';
// @ts-ignore
// import process from 'process';

import { Program } from './program';
import { Context } from './context';
import io from './io';
import { evaluate } from './eval';

const PROMPT = 'dbg> ';

export const userInput = async (context, prompt) => {
  context.outputStream.write(prompt);
  return io.input(context.inputStream);
};

class Debugger {
  constructor() {
    this.breakpoints = [];
  }

  /**
   * @param {string[]} args
   * @param {Program} program
   * @param {Context} context
   */
  cmdBreakpoint(args, program, context) {
    let line;

    if (args.length === 0) {
      line = program.lineIndexToNumber(context.pc);
    } else if (args.length === 1) {
      line = Number(args[0]);
    } else {
      io.printError('Usage: break [line-number]');
      return;
    }

    if (this.breakpoints.includes(line)) {
      io.print(`Breakpoint already exists for line ${line}`);
    } else {
      io.print(`Adding breakpoint on line ${line}`);
      this.breakpoints.push(line);
    }
  }

  /**
   * @param {string[]} args
   * @param {Program} program
   * @param {Context} context
   */
  async cmdPrint(args, program, context) {
    for (const arg of args) {
      const val = context.get(arg);
      if (val) {
        io.print(`${arg}: ${JSON.stringify(val)}`);
      } else {
        io.print(`${arg}: not found`);
      }
    }

    io.print();
  }

  /**
   * @param {string[]} args
   * @param {Program} program
   * @param {Context} context
   */
  async cmdSkip(args, program, context) {
    const line = program.lines[context.pc];
    io.print(`Skipping line ${line.num}`);
    context.pc += 1;
  }

  /**
   * @param {string[]} args
   * @param {Program} program
   */
  async cmdList(args, program) {
    for (const arg of args) {
      if (arg.startsWith('u')) {
        // List user functions
        io.print('User Functions:');
        const functions = program.getUserFunctions();
        for (const name of Object.keys(functions)) {
          const num = functions[name];
          const line = program.getLineByNumber(num);
          io.print(` - ${name}: ${line.source}`);
        }
        io.print();
      }
    }
  }

  /**
   * @param {Program} program
   * @param {Context} context
   */
  async enter(program, context) {
    let stepping = true;

    const shouldBreak = line => {
      if (stepping) {
        return true;
      }

      if (this.breakpoints.includes(line.num)) {
        return true;
      }

      return false;
    };

    for (;;) {
      const line = program.lines[context.pc];
      let evaluateNext = true;

      if (shouldBreak(line)) {
        evaluateNext = false;
        stepping = true;

        io.print(`Next line:\n ${line.source}`);

        let cmd = await userInput(context, PROMPT);

        cmd = cmd
          .trim()
          .split(' ')
          .filter(Boolean);

        const args = cmd.slice(1);
        cmd = cmd[0] || 'next';

        if (cmd.startsWith('b')) {
          // Break - Insert breakpoint at current line or by argument
          this.cmdBreakpoint(args, program, context);
        } else if (cmd.startsWith('n')) {
          // Next - Step one line
          evaluateNext = true;
        } else if (cmd.startsWith('c')) {
          // Continue - Run until end of program or breakpoint
          stepping = false;
          evaluateNext = true;
        } else if (cmd.startsWith('p')) {
          // "print"
          this.cmdPrint(args, program, context);
        } else if (cmd.startsWith('sk')) {
          // "skip"
          this.cmdSkip(args, program, context);
        } else if (cmd.startsWith('l')) {
          // "list"
          this.cmdList(args, program, context);
        }
      }

      if (evaluateNext) {
        await evaluate(program, context, true);
      }
    }
  }
}

export default Debugger;
