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
