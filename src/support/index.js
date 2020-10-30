/* eslint-disable no-unused-vars */

export const OpenMode = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
};

export class BaseSupport {
  finalize() {}

  async open(filename, mode, channel) {
    throw new Error('Not implemented');
  }

  async close(channel) {
    throw new Error('Not implemented');
  }

  /**
   * @param {number} channel
   * @param {string} value
   */
  async print(channel, value) {
    throw new Error('Not implemented');
  }

  async printError(message) {
    console.error(`${message}\n`);
  }

  /**
   * @param {number} channel
   * @returns {string}
   */
  async readLine(channel) {
    throw new Error('Not implemented');
  }
}
