import { Context } from './context';
import { builtinFunctions } from './BasicFunction';
import { parse } from './parser';
import Support from './support/storage';

export const setupEnvironment = source => {
  const support = new Support();
  const context = new Context(support);
  const builtins = builtinFunctions();
  const program = parse(source);

  for (const name of Object.keys(builtins)) {
    context.assignFunction(name, builtins[name]);
  }

  return { program, context };
};
