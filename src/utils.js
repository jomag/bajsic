import { Program } from './program';
import { Context } from './context';
import { builtinFunctions } from './function';
import { Value, ValueType } from './expr';
import { Line } from './line';

export function Enum(values) {
  const obj = values.reduce((o, val) => {
    o[val] = val;
    return o;
  }, {});
  return Object.freeze(obj);
}

export const setupEnvironment = source => {
  const program = new Program();
  const context = new Context();
  const builtins = builtinFunctions();

  for (let name of Object.keys(builtins)) {
    context.assignConst(name, new Value(ValueType.FUNCTION, builtins[name]));
  }

  if (source) {
    const lines = source.split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        program.add(Line.parse(line));
      }
    }

    const userFunctions = program.getUserFunctions();
    for (const name of Object.keys(userFunctions)) {
      context.assignConst(
        name,
        new Value(ValueType.USER_FUNCTION, userFunctions[name])
      );
    }
  }

  return { program, context };
};
