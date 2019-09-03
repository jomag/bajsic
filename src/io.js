import chalk from 'chalk';

export const print = text => {
  console.log(text === undefined ? '' : text);
};

export const printError = text => {
  console.error(chalk.redBright(text));
};

function printRuntimeError(e) {
  if (e.line) {
    let msg = `Runtime error on line ${e.line.num}: ${e.message}`;
    if (msg.length > 80) {
      msg = `Runtime error on line ${e.line.num}:\n  ${e.message}`;
    }
    printError(msg);
    printError(`=> ${e.line.source} <=`);
  } else {
    printError(`Runtime error: ${e.message}`);
  }
}

export default {
  print,
  printError,
  printRuntimeError
};
