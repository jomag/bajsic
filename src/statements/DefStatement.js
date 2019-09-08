// There are two supported function declaration statements:
// DEF and DEF FN. DEF FN seems to be an older variant with
// more restrictions and less functionality than DEF. For
// an interpreter implemented in modern JS the functionality
// difference is quite minimal though, so we use the same
// statement class for both types.
//
// DEF FN example, to define a function with name FNL$:
//
// 90800	DEF FNL$(X1$,X)
// 90805	IF X<=0 THEN FNL$="" \ GOTO 90815
// 90810	IF X>LEN(X1$) THEN FNL$=X1$ ELSE FNL$=LEFT$(X1$,X)
// 90815	FNEND
//
// I've yet to find a reference that exactly describes the
// way DEF FN is used in `stuga.bas`. All references I've found
// says that a `RETURN` statement is required, that `FNEND`
// must never be reached, and nothing about assigning the
// function name a value, as in the example above. So this
// implementation will be a compromise between the references
// and how it's actually used in the game.
//
// Update: the following reference, which is not from HP/VAX/DEC
// describes the exact behavior as used in the game:
// http://bitsavers.trailing-edge.com/pdf/dartmouth/BASIC_4th_Edition_Jan68.pdf

import { BaseStatement, StatementType } from '../statement';

export class DefStatement extends BaseStatement {
  constructor(dataType, name, args) {
    super(StatementType.DEF);
    this.dataType = dataType;
    this.name = name;
    this.args = args;
  }

  exec(program, context) {
    throw new Error('DEF statement should never be reached');
  }
}
