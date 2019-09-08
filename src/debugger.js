// @ts-check

import readline from 'readline';
import process from 'process';

import { Program } from './program';
import { Context } from './context';
import { RuntimeError } from './evaluate';
import io, { printError } from './io';

export const userInput = async prompt => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt
  });

  return new Promise((resolve, reject) => {
    rl.question(prompt, input => {
      rl.close();
      resolve(input);
    });
  });
};

const PROMPT = 'dbg> ';

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
  async cmdNext(args, program, context) {
    if (args.length !== 0) {
      io.printError('Usage: next');
      return;
    }

    const line = program.lines[context.pc];
    const next = await line.exec(program, context);

    if (next === null) {
      return null;
    }

    if (next !== undefined) {
      const lineIndex = program.lineNumberToIndex(next);
      if (lineIndex === undefined) {
        throw new RuntimeError(`Undefined line number: ${next}`);
      }
      context.pc = lineIndex;
    } else {
      context.pc = context.pc + 1;
      if (context.pc >= program.lines.length) {
        return null;
      }
    }
  }

  /**
   * @param {string[]} args
   * @param {Program} program
   * @param {Context} context
   */
  async cmdContinue(args, program, context) {
    if (args.length !== 0) {
      io.printError('Usage: continue');
      return;
    }

    while (true) {
      const line = program.lines[context.pc];

      if (this.breakpoints.includes(line.num)) {
        return;
      }

      const next = await line.exec(program, context);

      if (next === null) {
        return null;
      }

      if (next !== undefined) {
        const lineIndex = program.lineNumberToIndex(next);
        if (lineIndex === undefined) {
          throw new RuntimeError(`Undefined line number: ${next}`);
        }
        context.pc = lineIndex;
      } else {
        context.pc = context.pc + 1;
        if (context.pc >= program.lines.length) {
          return null;
        }
      }
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
   * @param {Context} context
   */
  async cmdList(args, program, context) {
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

  async enter(program, context) {
    while (true) {
      //console.log('Variables:\n', context.variables, '\n');
      const line = program.lines[context.pc];
      io.print(`Next line:\n ${line.source}`);

      let cmd = await userInput(PROMPT);
      cmd = cmd
        .trim()
        .split(' ')
        .filter(Boolean);
      const args = cmd.slice(1);
      cmd = cmd[0];

      if (!cmd) {
        cmd = 'next';
      }

      if (cmd.startsWith('b')) {
        // "breakpoint"
        this.cmdBreakpoint(args, program, context);
      } else if (cmd.startsWith('n')) {
        // "next"
        let result;
        try {
          result = await this.cmdNext(args, program, context);
        } catch (e) {
          if (e instanceof RuntimeError) {
            e.setContext(context, program);
            io.printRuntimeError(e);
          } else {
            throw e;
          }
        }

        if (result === null) {
          break;
        }
      } else if (cmd.startsWith('c')) {
        // "continue"
        let result;
        try {
          result = await this.cmdContinue(args, program, context);
        } catch (e) {
          if (e instanceof RuntimeError) {
            e.setContext(context, program);
            io.printRuntimeError(e);
          } else {
            throw e;
          }
        }

        if (result === null) {
          break;
        }
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
  }
}

export default Debugger;
