import moment from 'moment';
import { RuntimeError, IllegalFunctionCallError } from './error';
import { Value, ValueType } from './Value';

export class BasicFunction {
  /**
   * @param {number} argCount - number of required arguments
   * @param {number} optArgCount - number of extra, optional arguments
   * @param {Function} fun - the JavaScript function
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
    } else if (args.length !== this.argCount) {
      throw new RuntimeError(
        `Expected ${this.argCount} arguments, got ${args.length}`
      );
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

const validateNumber = value => {
  if (!value.isNumeric()) {
    throw new RuntimeError(`Expected numeric value, got ${value.type}`);
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
  const dateArg = args[0];
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
  }

  return new Value(ValueType.STRING, args[0].value);
};

const intFun = args => {
  validateNumber(args[0]);
  return new Value(ValueType.INT, Math.floor(args[0].value));
};

const rndFun = () => {
  // RND should ignore the single, optional argument.
  return new Value(ValueType.FLOAT, Math.random());
};

const chrFun = args => {
  validateNumber(args[0]);
  const i = Math.floor(args[0].value);
  return new Value(ValueType.STRING, String.fromCharCode(i));
};

const rightFun = args => {
  // Once again, the ref and both Stuga, C64 BASIC and GWBASIC differ
  // According to ref, this function should return all characters
  // from the nth until end of string. All other implementations
  // returns the n rightmost characters of the string.
  validateValueType(args[0], ValueType.STRING);
  validateNumber(args[1]);
  const str = args[0].value;
  const i = Math.floor(args[1].value);
  return new Value(
    ValueType.STRING,
    str.length > i ? str.substr(str.length - i) : str
  );
};

const echoFun = () => {
  console.log('FIXME: the ECHO function is not implemented.');
  return new Value(ValueType.INT, 1);
};

const midFun = args => {
  const [strVal, startVal, lenVal] = args;
  validateValueType(strVal, ValueType.STRING);
  validateNumber(startVal);
  validateNumber(lenVal);

  const [str, start, length] = [strVal.value, startVal.value, lenVal.value];

  if (start < 1) {
    throw new IllegalFunctionCallError('Start index must be 1 or higher');
  }

  const sub = str.slice(start - 1, start - 1 + length);
  return new Value(ValueType.STRING, sub);
};

const asciiFun = args => {
  const [str] = args;
  validateValueType(str, ValueType.STRING);

  if (str.value.length > 0) {
    return new Value(ValueType.INT, str.value.charCodeAt(0));
  }

  throw new IllegalFunctionCallError('Empty string');
};

const sleepFun = async ([seconds], context) => {
  validateNumber(seconds);
  // FIXME: should be interrupted when user is typing any delimiter, such as return
  //await new Promise(resolve => setTimeout(resolve, seconds.value * 1000.0));
  const result = await context.support.waitForInput(seconds.value * 1000.0);
  return new Value(ValueType.INT, result);
};

const valFun = async ([str]) => {
  validateValueType(str, ValueType.STRING);
  const num = parseFloat(str.value.replace(/,/, '.'));
  return new Value(ValueType.FLOAT, num);
};

const instrFun = args => {
  // The ref says three arguments are required, but stuga.bas does
  // not use the start index. So this implementation accepts either.
  /* eslint-disable prefer-destructuring */
  let start;
  let str;
  let substr;

  if (args.length === 2) {
    start = 1;
    str = args[0];
    substr = args[1];
  } else {
    start = args[0];
    str = args[1];
    substr = args[2];
    validateNumber(start);
    start = Math.floor(start.value);
  }

  validateValueType(str, ValueType.STRING);
  validateValueType(substr, ValueType.STRING);

  if (start < 1) {
    throw new IllegalFunctionCallError('Start index must be 1 or higher');
  }

  let pos = 0;

  if (!substr.value) {
    pos = 1;
  } else {
    pos = str.value.indexOf(substr.value, start - 1) + 1;
  }

  if (pos < start) {
    pos = 0;
  }

  return new Value(ValueType.INT, pos);
};

const spaceFun = ([n]) => {
  validateNumber(n);
  return new Value(ValueType.STRING, ' '.repeat(Math.floor(n.value)));
};

export const builtinFunctions = () => {
  return {
    sin: new BasicFunction(1, 0, ([angle]) => {
      return new Value(ValueType.INT, Math.sin(angle.value));
    }),
    TIME$: new BasicFunction(0, 1, timeDollar),
    DATE$: new BasicFunction(0, 1, dateDollar),
    LEN: new BasicFunction(1, 0, len),
    LEFT$: new BasicFunction(2, 0, leftDollar),
    INT: new BasicFunction(1, 0, intFun),
    RND: new BasicFunction(0, 1, rndFun),
    CHR$: new BasicFunction(1, 0, chrFun),
    INSTR: new BasicFunction(2, 1, instrFun),
    RIGHT$: new BasicFunction(2, 0, rightFun),
    MID$: new BasicFunction(3, 0, midFun),
    ASCII: new BasicFunction(1, 0, asciiFun),
    ASC: new BasicFunction(1, 0, asciiFun),
    SLEEP: new BasicFunction(1, 0, sleepFun),
    VAL: new BasicFunction(1, 0, valFun),
    ECHO: new BasicFunction(1, 0, echoFun),
    SPACE$: new BasicFunction(1, 0, spaceFun),
  };
};
