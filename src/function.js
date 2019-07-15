import { RuntimeError } from './evaluate';
import { Value, ValueType } from './expr';

class Function {
  constructor(argCount, fun) {
    this.argCount = argCount;
    this.fun = fun;
  }

  call(args, context) {
    if (args.length !== this.argCount) {
      throw new RuntimeError(
        `Expected ${this.argCount} arguments, got ${args.length}`
      );
    }

    return this.fun(args, context);
  }
}

export const builtinFunctions = () => {
  return {
    sin: new Function(1, ([angle]) => {
      return new Value(ValueType.INT, Math.sin(angle.value));
    })
  };
};
