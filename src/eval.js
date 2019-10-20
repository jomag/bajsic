/* eslint-disable no-param-reassign */

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

    const line = program.lines[context.cursor[0]];
    let next;

    while (context.cursor[1] < line.statements.length) {
      const stmt = line.statements[context.cursor[1]];
      next = await stmt.exec(program, context);
      if (next === undefined) {
        context.cursor[1] += 1;
      } else {
        break;
      }
    }

    if (next === null) {
      // If next is null, the program has reached its end
      context.pc = [0, 0];
      break;
    }

    if (next === undefined) {
      // If next is undefined, the program should continue with next line
      context.cursor = [context.cursor[0] + 1, 0];
      if (context.cursor[0] >= program.lines.length) {
        break;
      }
    } else {
      context.cursor = next;
    }
  }
};
