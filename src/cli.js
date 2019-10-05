import yargs from 'yargs';
import readline from 'readline';
import fs from 'fs';

import io from './io';
import { setupEnvironment } from './utils';
import { Stream } from './stream';
import { shell } from './shell';

export const userInput = async prompt => {
  const rl = readline.createInterface({
    prompt,
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question(prompt, input => {
      rl.close();
      resolve(input, reject);
    });
  });
};

const start = argv => {
  let program;
  let context;
  let source = '';

  for (const filename of argv._) {
    source += fs.readFileSync(filename, 'utf-8');
    source += '\n';
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
    context.outputStream.read();
  });

  context.outputStream.on('data', data => process.stdout.write(data));

  shell(program, context);
};

// eslint-disable-next-line no-unused-expressions
yargs
  .command(
    '*',
    'start bajsic interpreter',
    args => {
      args.positional('source', {
        describe: 'filename of basic source to run',
        type: 'string',
      });
    },
    start
  )
  .help().argv;
