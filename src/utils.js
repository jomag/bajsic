import { Context } from './context';
import { builtinFunctions } from './BasicFunction';
import { parse } from './parser';

export const setupEnvironment = (source, support) => {
  const context = new Context(support);
  const builtins = builtinFunctions();
  const program = parse(source);

  for (const name of Object.keys(builtins)) {
    context.assignFunction(name, builtins[name]);
  }

  return { program, context };
};
