import fs from 'fs';

import { Stream } from '../src/stream';
import { evaluateStatement } from '../src/evaluate';
import { RunStatement } from '../src/statement';
import { setupEnvironment } from '../src/utils';

const chai = require('chai');
const expect = chai.expect;

const tests = fs.readdirSync(__dirname).filter(name => name.endsWith('.bas'));

describe('Integration tests', () => {
  for (let test of tests) {
    const content = fs.readFileSync(`${__dirname}/${test}`, 'utf-8');
    const lines = content.split('\n');
    const basLines = [];
    const txtLines = [];
    let dst = basLines;

    const skip = lines[0] && lines[0].trim() === '--- skip ---';

    let expectError;
    let receivedError;

    for (let line of lines) {
      // Example: --- throws: "Out Of Memory" ---
      const throwMatch = line.match(/---+\s*throws:\s*"(.*)"/);

      if (throwMatch) {
        expectError = throwMatch[1];
      } else if (line.slice(0, 3) === '---') {
        dst = txtLines;
      } else {
        dst.push(line);
      }
    }

    const src = basLines.join('\n');
    const txt = txtLines.join('\n').trim();

    it(`${test}`, async function() {
      if (skip) {
        this.skip();
        return;
      }

      const { program, context } = setupEnvironment(src);

      let output = '';

      context.outputStream = new Stream();
      context.outputStream.on('data', data => {
        output = output + data;
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
        expect(expectError).to.equal(receivedError.message);
      }

      expect(output.trim()).to.equal(txt);
    });
  }
});
