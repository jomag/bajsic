import { InternalError } from './error';

/**
 * @enum {string}
 */
export const ValueType = {
  INT: 'int',
  STRING: 'string',
  FLOAT: 'float',
};

export class Value {
  /**
   * @param {ValueType} type
   * @param {*} value
   */
  constructor(type, value) {
    this.type = type;
    this.value = value;

    if (this.type === ValueType.STRING && typeof value !== 'string') {
      throw new InternalError(`Invalid raw value: ${value} (${typeof value})`);
    }
  }

  static defaultValue(type) {
    switch (type) {
      case ValueType.STRING:
        return new Value(type, '');
      case ValueType.INT:
        return new Value(type, 0);
      case ValueType.FLOAT:
        return new Value(type, 0.0);
      default:
        throw new InternalError(`Cannot create default value for ${type}`);
    }
  }

  /**
   * @returns {boolean}
   */
  isNumeric() {
    return this.type === ValueType.INT || this.type === ValueType.FLOAT;
  }

  isLessThan(other) {
    // FIXME: be more correct!
    return this.value < other.value;
  }

  isLessOrEqualTo(other) {
    return this.value <= other.value;
  }

  add(value) {
    return new Value(this.type, this.value + value.value);
  }

  isTrue() {
    switch (this.type) {
      case ValueType.INT:
        return this.value !== 0;
      default:
        throw new InternalError(`isTrue not implemented for type ${this.type}`);
    }
  }
}
