# Bajsic

Bajsic is a very, ehm, basic implementation of a BASIC interpreter, somewhat
compatible with DEC BASIC with the goal of being able to play the classic
Swedish text adventure _Stugan_.

The name Bajsic is a wordplay with BASIC and JS (JavaScript).

## Compliance

This interpreter aims to implement a subset of VAX BASIC, which was
the interpreter originally used to write _Stugan_ in late 70's.
The source code of the game is not 100% compatible with the
VAX BASIC reference (see below). This may be because the language
has changed in a non-backwards compatible way, or it may be because
I've still not got the right language reference.

### Underscore in INPUT statements

INPUT statements allows "," or ";" to separate the string presented
from the target variable:

```
INPUT "Question";A$
```

The _Stugan_ source code also uses underscore, which is not legal according
to the reference:

```
INPUT "Question"_A$
```

Currently this is handled by treating `,`, `;` and `_` equally.

## References

- [VAX Basic User Manual](http://bitsavers.trailing-edge.com/pdf/dec/vax/lang/basic/AA-HY15B-TE_VAX_BASIC_User_Manual_Feb90.pdf) (1990)
- [VAX Basic Reference Manual](http://bitsavers.trailing-edge.com/pdf/dec/vax/lang/basic/AA-HY16B-TE_VAX_BASIC_Reference_Manual_Feb90.pdf) (1990)
- [ Let's Build a Compiler, by Jack Crenshaw](https://compilers.iecc.com/crenshaw/) (1989)
- [A bunch of HP 9000 Basic references](http://bitsavers.informatik.uni-stuttgart.de/pdf/hp/9000_basic/)
- [This dialect has DEF FN matching Stuga source code](http://bitsavers.informatik.uni-stuttgart.de/pdf/dec/pdp11/rsts/V10/AA-2623D-TC_BASIC_PLUS_Lanuage_Manual_Dec1981.pdf)

## Q & A

### What is the current status?

There's code. It does stuff. But it does not interpret Basic (yet).

### Why not TypeScript?

Cause the name would not make sense.
