/* eslint-disable no-param-reassign */

import { RuntimeError } from './error';
import { Program } from './program';

/**
 * @param {Program} program
 * @param {any} context
 * @param {boolean} single only evaluate one line
 */
export const evaluate = async (program, context, single) => {
  let first = true;

  while (!single || first) {
    first = false;

    const line = program.lines[context.pc];
    const nextLine = await line.exec(program, context);

    if (nextLine === null) {
      context.pc = 0;
      break;
    }

    if (nextLine === undefined) {
      context.pc += 1;
      if (context.pc >= program.lines.length) {
        break;
      }
    } else {
      const lineIndex = program.lineNumberToIndex(nextLine);
      if (lineIndex === undefined) {
        throw new RuntimeError(`Undefined line: ${lineIndex}`);
      }
      context.pc = lineIndex;
    }
  }
};
