import { Line } from './line';
import { RuntimeError } from './error';

const PROMPT = '] ';

export const input = async stream => {
  return new Promise((resolve, reject) => {
    stream.once('data', data => resolve(data));
  });
};

export async function shell(program, context) {
  const printError = err => {
    let msg;

    if (err instanceof RuntimeError) {
      if (err.line) {
        msg = `Runtime error on line ${err.line.num}: ${err.message}`;
        if (msg.length > 80) {
          msg = `Runtime error on line ${err.line.num}:\n  ${err.message}`;
        }
        msg += `\n=> ${err.line.source} <=`;
      } else {
        msg = err.message;
      }
    } else if (typeof err === 'string') {
      msg = err;
    } else {
      msg = err.message;
    }

    if (context.errorStream) {
      context.errorStream.write(`${msg}\n`);
    } else {
      console.error(msg);
    }
  };

  while (true) {
    context.outputStream.write(PROMPT);
    const text = await input(context.inputStream);

    let line;

    try {
      line = Line.parse(text.trim());
    } catch (e) {
      printError(e);
      continue;
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
            printError(e);
            return;
          } else {
            printError(`There was an unhandled error:`);
            printError(e);
            printError(JSON.stringify(e.stack, null, 2));
            console.log(e.stack);
            console.trace();
            printError(`Context: line index ${context.pc}`);
          }
        }
      } else {
        program.add(line);
      }
    }
  }
}
