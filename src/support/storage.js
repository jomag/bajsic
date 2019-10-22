import fs from 'fs';
import util from 'util';

import { Stream } from '../stream';

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

    this.inputStream = new Stream();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', data => {
      this.inputStream.write(data);
    });

    this.outputStream = new Stream();
    this.outputStream.on('data', () => {
      this.outputStream.read();
    });

    this.outputStream.on('data', data => process.stdout.write(data));
  }

  async open(filename, mode, channel) {
    console.log(`open ${filename} as #${channel} for ${mode}`);
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
  async print(channel, value, lineBreak) {
    const buf = lineBreak ? `${value}\n` : `${value}`;
    if (channel === 0) {
      this.outputStream.write(buf);
    } else {
      const fd = this.fileDescriptors[channel];
      if (fd) {
        await fsWrite(fd, buf);
      }
    }
  }

  /**
   * @param {number} channel
   */
  async input(channel) {
    if (channel === 0) {
      return new Promise(resolve => {
        this.inputStream.once('data', data => resolve(data));
      });
    } else {
      return fsRead;
    }
  }
}

export default Support;
