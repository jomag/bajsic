import fs from 'fs';
import util from 'util';
import readline from 'readline';

import { Stream } from '../stream';
import { RuntimeError } from '../error';

const fsOpen = util.promisify(fs.open);
const fsWrite = util.promisify(fs.write);
const fsClose = util.promisify(fs.close);

export const OpenMode = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
};

class Support {
  constructor() {
    this.fileDescriptors = {};

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  finalize() {
    for (const fd of Object.values(this.fileDescriptors)) {
      fsClose(fd);
    }
    this.rl.close();
  }

  async open(filename, mode, channel) {
    if (this.fileDescriptors[channel]) {
      await fsClose(this.fileDescriptors[channel]);
      delete this.fileDescriptors[channel];
    }

    const flags = mode === OpenMode.INPUT ? 'r' : 'w';
    const fd = await fsOpen(filename, flags);
    this.fileDescriptors[channel] = fd;
  }

  async close(channel) {
    if (this.fileDescriptors[channel]) {
      await fsClose(this.fileDescriptors[channel]);
      delete this.fileDescriptors[channel];
    }
  }

  /**
   *
   * @param {number} channel
   * @param {Value} value
   * @param {boolean} lineBreak
   */
  async print(channel, value) {
    const buf = `${value}`;
    if (channel === 0) {
      process.stdout.write(buf);
    } else {
      const fd = this.fileDescriptors[channel];
      if (fd) {
        await fsWrite(fd, buf);
      }
    }
  }

  /**
   * @param {number} channel
   * @returns {string}
   */
  async readLine(channel) {
    if (channel === 0) {
      return new Promise(resolve => {
        this.rl.once('line', data => resolve(data));
      });
    }

    const fd = this.fileDescriptors[channel];

    if (!fd) {
      throw new RuntimeError('Bad file number');
    }

    const buf = Buffer.alloc(4);
    let line = '';

    while (fs.readSync(fd, buf, 0, 1) > 0) {
      const char = buf.toString('utf8')[0];

      if (char === '\n') {
        break;
      }

      line += char;
    }

    return line;
  }
}

export default Support;
