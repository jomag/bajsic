import fs from 'fs';
import { expect } from 'chai';

import { RunStatement } from '../src/statements/RunStatement';
import { setupEnvironment } from '../src/utils';

const tests = fs.readdirSync(__dirname).filter(name => name.endsWith('.bas'));

class TestSupport {
  constructor() {
    this.output = '';
    this.files = {};
    this.openFiles = {};
  }

  finalize() {}

  open(filename, mode, channel) {
    if (this.openFiles[channel]) {
      throw new Error(`Channel #${channel} is already in use`);
    }
    this.openFiles[channel] = { filename, line: 0 };
    if (!this.files[filename]) {
      this.files[filename] = '';
    }
  }

  close(channel) {
    if (!this.openFiles[channel]) {
      throw new Error(`Attempt to close unavailable channel: #${channel}`);
    }
    delete this.openFiles[channel];
  }

  print(channel, value) {
    if (channel === 0) {
      this.output += value;
    } else {
      if (!this.openFiles[channel]) {
        throw new Error(`Channel #${channel} is not available`);
      }

      const { filename } = this.openFiles[channel];
      this.files[filename] += value;
    }
  }

  readLine(channel) {
    if (channel === 0) {
      throw new Error(
        '"readLine" is not implemented for channel #0 in TestSupport'
      );
    }

    if (!this.openFiles[channel]) {
      throw new Error(`Channel #${channel} is not available`);
    }

    const { filename, line } = this.openFiles[channel];
    const lines = this.files[filename].split('\n');
    console.log('LINES:', lines);
    console.log('LINE', line);
    this.openFiles[channel].line += 1;
    const data = lines[line];
    return data;
  }
}

describe('Integration tests', () => {
  for (const test of tests) {
    const content = fs.readFileSync(`${__dirname}/${test}`, 'utf-8');
    const lines = content.split('\n');
    const basLines = [];
    const txtLines = [];
    let dst = basLines;

    const skip = lines[0] && lines[0].trim() === '--- skip ---';

    let expectError;
    let receivedError;

    for (const line of lines) {
      // Example: --- throws: "Out Of Memory" ---
      const throwMatch = line.match(/---+\s*throws:\s*"(.*)"/);

      if (throwMatch) {
        // eslint-disable-next-line prefer-destructuring
        expectError = throwMatch[1];
      } else if (line.slice(0, 3) === '---') {
        dst = txtLines;
      } else {
        dst.push(line);
      }
    }

    const src = basLines.join('\n');
    const txt = txtLines.join('\n');

    it(`${test}`, async () => {
      if (skip) {
        this.skip();
        return;
      }

      const support = new TestSupport();
      const { program, context } = setupEnvironment(src, support);

      try {
        await new RunStatement().exec(program, context);
      } catch (e) {
        if (expectError) {
          receivedError = e;
        } else {
          throw e;
        }
      }

      if (expectError) {
        expect(receivedError).to.not.be.undefined;
        expect(expectError).to.equal(receivedError.message);
      }

      expect(support.output).to.equal(txt);
    });
  }
});
