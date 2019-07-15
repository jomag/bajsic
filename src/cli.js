import yargs from 'yargs';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';

import { Line } from './line';
import { SyntaxError } from './parser';
import { Program } from './program';
import { Context } from './context';
import { RuntimeError } from './evaluate';

const PROMPT = '] ';

function printError(msg) {
  console.error(chalk.redBright(msg));
}

function startInteractiveMode(program, context) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT
  });

  rl.prompt();

  rl.on('line', text => {
    let line;

    try {
      line = Line.parse(text);
    } catch (e) {
      if (e instanceof SyntaxError) {
        printError(e.message);
        rl.prompt();
        return;
      } else {
        throw e;
      }
    }

    if (line.statements.length === 0) {
      if (line.num !== undefined) {
        console.error(`FIXME: should delete line ${line.lineNo}`);
      }
    } else {
      if (line.num === undefined) {
        try {
          line.exec(program, context);
        } catch (e) {
          if (e instanceof RuntimeError) {
            printError(e.message);
            rl.prompt();
            return;
          }
        }
      } else {
        program.add(line);
      }
    }

    rl.prompt();
  });
}

function start(argv) {
  const program = new Program();
  const context = new Context();

  for (let source of argv['_']) {
    const srcOriginal = fs.readFileSync(source, 'utf-8');
    const srcLines = srcOriginal.split('\n');
    let n = 0;
    for (const src of srcLines) {
      try {
        const line = Line.parse(src);
        program.add(line);
      } catch (e) {
        if (e instanceof SyntaxError) {
          printError(e.message);
          break;
        } else {
          console.error(`Unexpected error on line ${n}`);
          throw e;
        }
      }

      n = n + 1;
    }

    const precompiled = precompile(source);
  }

  startInteractiveMode(program, context);
}

yargs
  .command(
    '*',
    'start bajsic interpreter',
    yargs => {
      yargs.positional('source', {
        describe: 'filename of basic source to run',
        type: 'string'
      });
    },
    start
  )
  .help().argv;
