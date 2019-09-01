// @ts-check

import { RuntimeError } from './evaluate';

export default class BasicArray {
  // @param type - the data type of the array
  // @param dimensions - array of dimensions: [[0,100], [10, 20]]
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
      index = index + (dim[1] - dim[0]) * path[i];
    }

    return index + path[path.length - 1];
  }

  /**
   * @param {number} path
   * @param {string|number} value
   */
  set(path, value) {
    console.log(`PATH: ${path} VALUE: ${value}`);
    const index = this.pathToIndex(path);
    this.data[index] = value;
  }

  get(path) {
    const index = this.pathToIndex(path);
    return this.data[index];
  }

  totalSize() {
    // Returns the total number of cells in this array
    return this.dimensions.reduce((total, dim) => total * (dim[1] - dim[0]), 1);
  }
}
