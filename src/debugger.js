// @ts-check

import readline from 'readline';
import process from 'process';

import { Program } from './program';
import { Context } from './context';
import { RuntimeError } from './evaluate';

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
      console.error('Usage: break [line-number]');
      return;
    }

    if (this.breakpoints.includes(line)) {
      console.log(`Breakpoint already exists for line ${line}`);
    } else {
      console.log(`Adding breakpoint on line ${line}`);
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
      console.error('Usage: next');
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
      console.error('Usage: next');
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

  async enter(program, context) {
    while (true) {
      //console.log('Variables:\n', context.variables, '\n');
      const line = program.lines[context.pc];
      console.log('Next line:\n', line.source);

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
        this.cmdBreakpoint(args, program, context);
      } else if (cmd.startsWith('n')) {
        const result = await this.cmdNext(args, program, context);
        if (result === null) {
          break;
        }
      } else if (cmd.startsWith('c')) {
        const result = await this.cmdContinue(args, program, context);
        if (result === null) {
          break;
        }
      }
    }
  }
}

export default Debugger;
