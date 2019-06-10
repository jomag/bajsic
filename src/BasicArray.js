import { RuntimeError } from './evaluate';

export default class BasicArray {
  // @param type - the data type of the array
  // @param dimensions - array of dimensions: [[0,100], [10, 20]]
  constructor(type, dimensions) {
    this.type = type;
    this.dimensions = dimensions;
    this.data = {};
  }

  set(path, value) {
    if (path.length !== this.dimensions.length) {
      throw new RuntimeError('Bad subscript error');
    }

    let o = this.data;
    for (let i = 0; i < path.length; i++) {
      o = o[path[i]] || {};
    }

    for (const i of path) {
    }
  }

  get(path) {
    if (path.length !== this.dimensions.length) {
      throw new RuntimeError('Bad subscript error');
    }

    let o = this.data;
    for (let i = 0; i < path.length - 1; i++) {
      o = o[path[i]] || {};
    }

    return o[path[path.length-1]];
  }

  totalSize() {
    // Returns the total number of cells in this array
    return this.dimensions.reduce((total, dim) => total * (dim[1] - dim[0]), 1);
  }
}
