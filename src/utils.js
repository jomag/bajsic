import { Program } from './program';
import { Context } from './context';
import { builtinFunctions } from './BasicFunction';

export const setupEnvironment = source => {
  const program = new Program();
  const context = new Context();
  const builtins = builtinFunctions();

  for (let name of Object.keys(builtins)) {
    context.assignFunction(name, builtins[name]);
  }

  if (source) {
    program.loadFromString(source, context);
  }

  return { program, context };
};
