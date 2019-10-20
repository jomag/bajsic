/* eslint-disable no-param-reassign */

import { Program } from './program';

/**
 * @param {Program} program
 * @param {any} context
 * @param {boolean} single only evaluate one line
 */
export const evaluate = async (program, context) => {
  while (context.pc < program.statements.length) {
    const stmt = program.statements[context.pc];
    if (stmt === 'eol') {
      context.pc += 1;
    } else {
      const next = await stmt.exec(program, context);
      context.pc = next === undefined ? context.pc + 1 : next;
    }
  }
};
