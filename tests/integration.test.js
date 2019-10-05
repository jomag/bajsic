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

    for (let line of lines) {
      if (line.slice(0, 3) === '---') {
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

      await evaluateStatement(new RunStatement(), program, context);
      expect(output.trim()).to.equal(txt);
    });
  }
});
