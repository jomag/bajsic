# Bajsic

[![CircleCI](https://circleci.com/gh/jomag/bajsic/tree/master.svg?style=svg)](https://circleci.com/gh/jomag/bajsic/tree/master)

## BASIC dialect

I set out to write this interpreter with the single goal of being
able to play the Swedish text adventure game _Stuga_ ("Cottage")
written in the late 70's in _some version_ of DEC BASIC.

The source code of _Stuga_ is published with permission from the
original authors on this site:

http://microheaven.com/svenska/stuga.shtml

One of the big problems was to find exactly what dialect was used,
as it has changed through the year and it's quite hard to find a
reference for older versions. The references available on the
Internet are typically scanned PDF's of the original paper
references, so text search rarely works.

One hint in finding the dialect used by the game is the usage of
`IF` as a modifier:

```basic
10 GOTO 20 IF X > Y
```

This syntax is not that common in BASIC dialects, but it's described
in this VAX BASIC reference from 1990:

[VAX Basic User Manual](http://bitsavers.trailing-edge.com/pdf/dec/vax/lang/basic/AA-HY15B-TE_VAX_BASIC_User_Manual_Feb90.pdf) (1990)

I implemented substantial parts of the interpreter based on that,
but when I found how functions are defined in the game, I had to look
further. The reference above supports defining functions with the
`DEF` statement. The `DEF` statement should be followed by a code
block eventually ending with a `RETURN` statement followed by a
`FNEND` statement to define the end of the function. But the function
declarations in the game instead looks like this:

```basic
90800	DEF FNL$(X1$,X)
90805	IF X<=0 THEN FNL$="" \ GOTO 90815
90810	IF X>LEN(X1$) THEN FNL$=X1$ ELSE FNL$=LEFT$(X1$,X)
90815	FNEND
```

So instead of a `RETURN` statement, `FNL$` is assigned a value
and the function returns when `FNEND` is reached, which is forbidden
in the 1990's reference.

I found this reference of "BASIC 4.0 for the HP 9000 series 200/300
computers" which includes the `DEF FN` statement mostly as used in
the game (except that the reference says it's an error if `FNEND`
is reached):

[BASIC 4.0 reference](http://bitsavers.informatik.uni-stuttgart.de/pdf/dec/pdp11/rsts/V10/AA-2623D-TC_BASIC_PLUS_Lanuage_Manual_Dec1981.pdf)

DEC was bought by Compaq in 1997/98, which in turn was merged with
HP in 2001/02, so there is a path from DEC to HP. But as this happened
long after the reference was written (1985) it's most likely not
the exact version used when the game was written.

To conclude: I've mostly given up on doing a strict implementation
of a fixed dialect of BASIC. I will make sure all statements in the
game works as expected, but I may add statements that does not follow
any of the references listed, and I will also not implement all
functionality of any reference.

## Mysteries

There are still some statements and functions I've not found any
documentation of.

### CRT

A function likely related to the display in one way or another.
Used once in the game:

```basic
90064	X=CRT(1)
```

### QUOTE

Used when saving game state to disk:

```basic
80105	MARGIN #1,132 \ QUOTE #1 \ X=0'&&&&&
```

### SLEEP

In all used references, SLEEP is a statement. But in the game it is used as
a function:

```basic
09419	D=SLEEP(3) \ IF D THEN INPUT ""_A$
```

From all usages in the code it seems like `SLEEP` will sleep for the specified
number of seconds, unless interrupted by user input. The return value is
true if the function was interrupted before its timeout.

### Underscores in INPUT statements

INPUT statements allows "," or ";" to separate the string presented
from the target variable:

```basic
INPUT "Question";A$
```

The _Stugan_ source code also uses underscore, which is not legal according
to the reference:

```basic
INPUT "Question"_A$
```

Currently this is handled by treating `,`, `;` and `_` equally.

## References

- [VAX Basic User Manual](http://bitsavers.trailing-edge.com/pdf/dec/vax/lang/basic/AA-HY15B-TE_VAX_BASIC_User_Manual_Feb90.pdf) (1990)
- [VAX Basic Reference Manual](http://bitsavers.trailing-edge.com/pdf/dec/vax/lang/basic/AA-HY16B-TE_VAX_BASIC_Reference_Manual_Feb90.pdf) (1990)
- [ Let's Build a Compiler, by Jack Crenshaw](https://compilers.iecc.com/crenshaw/) (1989)
- [A bunch of HP 9000 Basic references](http://bitsavers.informatik.uni-stuttgart.de/pdf/hp/9000_basic/)
- [BASIC 4.0 for the HP 9000 series 200/300 computers](http://bitsavers.informatik.uni-stuttgart.de/pdf/dec/pdp11/rsts/V10/AA-2623D-TC_BASIC_PLUS_Lanuage_Manual_Dec1981.pdf)
- [Small BASIC Interpreters](https://sites.google.com/site/smallbasicinterpreters/)

## Q & A

### What is the current status?

There's code. It does stuff. But it does not interpret Basic (yet).

### Why not TypeScript?

Cause the name would not make sense.
