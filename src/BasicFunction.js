import moment from 'moment';
import { RuntimeError } from './error';
import { Value, ValueType } from './expr';

export class BasicFunction {
  /**
   * @param {number} argCount - number of required arguments
   * @param {number} optArgCount - number of extra, optional arguments
   * @param {function} fun - the JavaScript function
   */
  constructor(argCount, optArgCount, fun) {
    this.argCount = argCount;
    this.optArgCount = optArgCount;
    this.fun = fun;
  }

  call(args, program, context) {
    if (this.optArgCount) {
      if (
        args.length < this.argCount ||
        args.length > this.argCount + this.optArgCount
      ) {
        throw new RuntimeError(
          `Expected ${this.argCount} to ${this.argCount +
            this.optArgCount} arguments, got ${args.length}`
        );
      }
    } else {
      if (args.length !== this.argCount) {
        throw new RuntimeError(
          `Expected ${this.argCount} arguments, got ${args.length}`
        );
      }
    }

    return this.fun(args, context);
  }
}

const twoDigits = n => (n > 9 ? `${n}` : `0${n}`);

/**
 * @param {Value} value
 * @param {ValueType} type
 */
const validateValueType = (value, type) => {
  if (value.type !== type) {
    throw new RuntimeError(`Expected value of type ${type}, got ${value.type}`);
  }
};

const timeDollar = args => {
  let minutesBeforeMidnight = args ? args[0] : 0;
  let timeOfDay;

  if (minutesBeforeMidnight) {
    validateValueType(minutesBeforeMidnight, ValueType.INT);
    minutesBeforeMidnight = minutesBeforeMidnight.value;
  }

  if (minutesBeforeMidnight === undefined || minutesBeforeMidnight === 0) {
    const midnight = new Date();
    midnight.setHours(0);
    midnight.setMinutes(0);
    midnight.setSeconds(0);
    midnight.setMilliseconds(0);
    timeOfDay = Math.floor(
      (new Date().getTime() - midnight.getTime()) / 1000 / 60
    );
  } else {
    timeOfDay = 1440 - minutesBeforeMidnight;
  }

  const hour = Math.floor(timeOfDay / 60);
  const minute = Math.floor(timeOfDay % 60);
  let result;

  if (hour >= 12) {
    result = `${twoDigits(hour - 12)}:${twoDigits(minute)} PM`;
  } else {
    result = `${twoDigits(hour)}:${twoDigits(minute)} AM`;
  }

  return new Value(ValueType.STRING, result);
};

const dateDollar = args => {
  let dateArg = args[0];
  let date;

  if (dateArg) {
    validateValueType(dateArg, ValueType.INT);
    const dateInt = dateArg.value;
    const year = 1970 + Math.floor(dateInt / 1000);
    const dayOfYear = dateInt % 1000;
    date = new Date(Date.UTC(year, 0));
    date.setDate(dayOfYear);
  } else {
    date = new Date();
  }

  const result = moment(date).format('DD-MMM-YY');
  return new Value(ValueType.STRING, result);
};

const len = args => {
  validateValueType(args[0], ValueType.STRING);
  return new Value(ValueType.INT, args[0].value.length);
};

const leftDollar = args => {
  validateValueType(args[0], ValueType.STRING);
  validateValueType(args[1], ValueType.INT);

  const n = args[1].value;

  if (n >= 0) {
    return new Value(ValueType.STRING, args[0].value.slice(0, n));
  } else {
    return new Value(ValueType.STRING, args[0].value);
  }
};

export const builtinFunctions = () => {
  return {
    sin: new BasicFunction(1, 0, ([angle]) => {
      return new Value(ValueType.INT, Math.sin(angle.value));
    }),
    ['TIME$']: new BasicFunction(0, 1, timeDollar),
    ['DATE$']: new BasicFunction(0, 1, dateDollar),
    ['LEN']: new BasicFunction(1, 0, len),
    ['LEFT$']: new BasicFunction(2, 0, leftDollar),
  };
};
