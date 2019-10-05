import chalk from 'chalk';

const print = text => {
  console.log(text === undefined ? '' : text);
};

const printError = text => {
  console.error(chalk.redBright(text));
};

const input = async stream => {
  return new Promise(resolve => {
    stream.once('data', data => resolve(data));
  });
};

/**
 * @param {Error} e
 */
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
  printRuntimeError,
  input,
};
