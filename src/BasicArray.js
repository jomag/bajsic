// @ts-check

import { RuntimeError } from './error';
import { Value, ValueType } from './Value';

export default class BasicArray {
  /**
   * @param {ValueType} type - the data type of the array
   * @param {*} dimensions - array of dimensions
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
      index += (dim[1] - dim[0]) * path[i];
    }

    return index + path[path.length - 1];
  }

  /**
   * @param {number[]} path
   * @param {Value} value
   */
  set(path, value) {
    if (value.type !== this.type) {
      throw new RuntimeError(
        `Assigning value of type "${value.type}" to array of type "${this.type}"`
      );
    }

    const index = this.pathToIndex(path);
    this.data[index] = value.value;
  }

  get(path) {
    const index = this.pathToIndex(path);
    return new Value(this.type, this.data[index]);
  }

  totalSize() {
    // Returns the total number of cells in this array
    return this.dimensions.reduce((total, dim) => total * (dim[1] - dim[0]), 1);
  }
}
