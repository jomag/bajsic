import { EventEmitter } from 'events';

export class Stream extends EventEmitter {
  constructor() {
    super();
    this.buffer = [];

    // There are three states for flowing:
    //
    // null - no consumer of data
    // false - stream has been paused
    // true - there are consumer of data, and the stream is not paused
    this.flowing = null;

    this.on('newListener', () => {
      if (this.flowing === null) {
        this.flowing = true;
      }
    });
  }

  write(data) {
    this.buffer.push(data);
    if (this.flowing) {
      this.emit('data', data);
    }
  }

  read() {
    return this.buffer.pop();
  }
}
