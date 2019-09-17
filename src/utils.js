import { Program } from './program';
import { Context } from './context';
import { builtinFunctions } from './function';
import { Value, ValueType } from './expr';

export const setupEnvironment = source => {
  const program = new Program();
  const context = new Context();
  const builtins = builtinFunctions();

  for (let name of Object.keys(builtins)) {
    context.assignConst(name, new Value(ValueType.FUNCTION, builtins[name]));
  }

  if (source) {
    program.loadFromString(source, context);
  }

  return { program, context };
};
