import fs from 'fs';
import stream from 'stream';

import { Context } from '../src/context';
import { Program } from '../src/program';
import { Line } from '../src/line';
import { evaluate } from '../src/evaluate';
import { Statement, StatementType } from '../src/parser';
import { Value, ValueType } from '../src/expr';
import { builtinFunctions } from '../src/function';

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

    const txt = txtLines.join('\n').trim();

    it(`${test}`, () => {
      const program = new Program();
      const context = new Context();
      const functions = builtinFunctions();

      for (let name of Object.keys(functions)) {
        context.assignConst(
          name,
          new Value(ValueType.FUNCTION, functions[name])
        );
      }

      for (const src of basLines) {
        const line = Line.parse(src);
        program.add(line);
      }

      let output = '';
      context.stdout = new stream.Writable({ decodeStrings: false });
      context.stdout._write = (chunk, enc, next) => {
        output = output + chunk;
        next();
      };

      evaluate(new Statement(StatementType.RUN), program, context);
      expect(output.trim()).to.equal(txt);
    });
  }
});
