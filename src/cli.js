import yargs from 'yargs';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';

import { Line } from './line';
// import { SyntaxError } from './parser';
import { Program } from './program';
import { Context } from './context';
import { RuntimeError } from './evaluate';
import { Value, ValueType } from './expr';
import { builtinFunctions } from './function';
import io from './io';
import { setupEnvironment } from './utils';

const PROMPT = '] ';

export const userInput = async prompt => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt,
  });

  return new Promise((resolve, reject) => {
    rl.question(prompt, input => {
      rl.close();
      resolve(input, reject);
    });
  });
};

async function startInteractiveMode(program, context) {
  while (true) {
    const text = await userInput(PROMPT);
    let line;

    try {
      line = Line.parse(text);
    } catch (e) {
      if (e instanceof SyntaxError) {
        io.printError(e.message);
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
          await line.exec(program, context);
        } catch (e) {
          if (e instanceof RuntimeError) {
            e.setContext(context, program);
            io.printRuntimeError(e);
            return;
          } else {
            throw e;
          }
        }
      } else {
        program.add(line);
      }
    }
  }
}

function start(argv) {
  let program;
  let context;

  for (let filename of argv['_']) {
    const source = fs.readFileSync(filename, 'utf-8');
    try {
      ({ program, context }) = setupEnvironment(source);
    } catch (e) {
      if (e instanceof SyntaxError) {
        io.printError(`Line ${n}: ${e.message}`);
        break;
      } else {
        console.error(`Unexpected error on line ${n}:\n${src}\n`);
        throw e;
      }
    }
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
        type: 'string',
      });
    },
    start
  )
  .help().argv;
