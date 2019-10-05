import fs from 'fs';
import { expect } from 'chai';

import { Stream } from '../src/stream';
import { evaluateStatement } from '../src/evaluate';
import { RunStatement } from '../src/statement';
import { setupEnvironment } from '../src/utils';

const tests = fs.readdirSync(__dirname).filter(name => name.endsWith('.bas'));

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
    const txt = txtLines.join('\n').trim();

    it(`${test}`, async () => {
      if (skip) {
        this.skip();
        return;
      }

      const { program, context } = setupEnvironment(src);
      let output = '';

      context.outputStream = new Stream();
      context.outputStream.on('data', data => {
        output += data;
      });

      try {
        await evaluateStatement(new RunStatement(), program, context);
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

      expect(output.trim()).to.equal(txt);
    });
  }
});
