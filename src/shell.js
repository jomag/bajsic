import { Line } from './line';
import { RuntimeError } from './evaluate';

const PROMPT = '] ';

const input = async stream => {
  return new Promise((resolve, reject) => {
    stream.once('data', () => resolve(stream.read()));
  });
};

export async function shell(program, context) {
  while (true) {
    context.outputStream.write(PROMPT);
    const text = await input(context.inputStream);
    console.log(`USE RINPUT: [${text}]`);

    let line;

    try {
      line = Line.parse(text.trim());
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
