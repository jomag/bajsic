// BASIC arrays are declared using the DIM statement:
//
// 10 DIM A(3, 4)
//
// This statement creates a new array (or more precise, a matrix)
// of two dimensions. As the index is zero-based, the first dimension
// has length 4 and the second has length 5.

import { RuntimeError } from './error';
import { Value, ValueType, castValue } from './Value';

export default class BasicArray {
  /**
   * @param {ValueType} type - the data type of the array
   * @param {Array.<number[]>} dimensions - array of dimensions
   */
  constructor(type, dimensions) {
    this.type = type;
    this.dimensions = dimensions;
    this.data = [];
  }

  pathToIndex(path) {
    if (path.length !== this.dimensions.length) {
      throw new RuntimeError('Bad subscript error');
    }

    let index = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const dim = this.dimensions[i];
      index += (dim[1] - dim[0] + 1) * path[i];
    }

    return index + path[path.length - 1];
  }

  /**
   * @param {number[]} path
   * @param {Value} value
   */
  set(path, value) {
    const index = this.pathToIndex(path);
    const casted = castValue(value, this.type);
    this.data[index] = casted.value;
  }

  get(path) {
    const index = this.pathToIndex(path);
    return this.data[index] === undefined
      ? Value.defaultValue(this.type)
      : new Value(this.type, this.data[index]);
  }

  totalSize() {
    // Returns the total number of cells in this array
    return this.dimensions.reduce((total, dim) => total * (dim[1] - dim[0]), 1);
  }
}
