import yargs from 'yargs';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';

// import { SyntaxError } from './parser';
import { Program } from './program';
import { Context } from './context';
import { Value, ValueType } from './expr';
import { builtinFunctions } from './function';
import io from './io';
import { setupEnvironment } from './utils';
import { Stream } from './stream';
import { shell } from './shell';

export const userInput = async prompt => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt
  });

  return new Promise((resolve, reject) => {
    rl.question(prompt, input => {
      rl.close();
      resolve(input, reject);
    });
  });
};

function setupStreams(context) {}

function start(argv) {
  let program;
  let context;
  let source = '';

  for (let filename of argv['_']) {
    source += fs.readFileSync(filename, 'utf-8') + '\n';
  }

  try {
    const env = setupEnvironment(source);
    program = env.program;
    context = env.context;
  } catch (e) {
    if (e instanceof SyntaxError) {
      io.printError(e.message);
    } else {
      throw e;
    }
  }

  context.inputStream = new Stream();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', data => {
    context.inputStream.write(data);
  });

  context.outputStream = new Stream();
  context.outputStream.on('data', () => {
    const data = context.outputStream.read();
  });

  context.outputStream.on('data', data => process.stdout.write(data));

  shell(program, context);
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
