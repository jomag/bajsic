import yargs from 'yargs';
import readline from 'readline';
import chalk from 'chalk';

import { Line } from './line';
import { SyntaxError } from './parse';
import { Program } from './program';
import { Context } from './context';

const PROMPT = '] ';

function printError(msg) {
  console.error(chalk.redBright(msg));
}

function startInteractiveMode(program, context) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
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
        line.exec(program, context);
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

  if (argv.source) {
    const sourceText = fs.readFileSync(argv.source, 'utf-8');
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
        type: 'string',
      });
    },
    start
  )
  .help().argv;
