import { RuntimeError } from './error';
import { Program } from './program';
import { Context } from './context';
import { parseLine } from './parser';

const PROMPT = '] ';

/**
 * @param {Program} program
 * @param {Context} context
 */
export async function shell(program, context) {
  const printError = (err) => {
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

  for (;;) {
    context.support.print(0, PROMPT, false);
    const text = await context.support.readLine(0);
    let line;

    try {
      line = parseLine(text.trim());
    } catch (e) {
      printError(e);

      // eslint-disable-next-line no-continue
      continue;
    }

    if (line.num !== undefined) {
      if (line.statements.length === 0) {
        console.error(`FIXME: should delete line ${line.lineNo}`);
      } else {
        program.add(line);
      }
    } else {
      try {
        let pc = 0;
        while (pc < line.statements.length) {
          const next = await line.statements[pc].exec(program, context);
          pc = next === undefined ? pc + 1 : next;
        }
      } catch (e) {
        if (e instanceof RuntimeError) {
          e.setContext(context, program);
          printError(e);
          return;
        }

        printError(`There was an unhandled error:`);
        printError(e);
        printError(JSON.stringify(e.stack, null, 2));
        console.log(e.stack);
        console.trace();
        printError(
          `Context: line index ${context.pc}:\n    ${
            program.lines[context.pc].source
          }`
        );
      }
    }
  }
}
