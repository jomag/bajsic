import fs from 'fs';
import stream from 'stream';

import { Context } from '../src/context';
import { Program } from '../src/program';
import { Line } from '../src/line';
import { evaluateStatement } from '../src/evaluate';
import { Value, ValueType } from '../src/expr';
import { builtinFunctions } from '../src/function';
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

    for (let line of lines) {
      if (line.slice(0, 3) === '---') {
        dst = txtLines;
      } else {
        dst.push(line);
      }
    }

    const src = basLines.join('\n');
    const txt = txtLines.join('\n').trim();

    it(`${test}`, async () => {
      const { program, context } = setupEnvironment(src);

      let output = '';
      context.stdout = new stream.Writable({ decodeStrings: false });
      context.stdout._write = (chunk, enc, next) => {
        output = output + chunk;
        next();
      };

      await evaluateStatement(new RunStatement(), program, context);
      expect(output.trim()).to.equal(txt);
    });
  }
});
