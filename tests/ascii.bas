10 X="ABCabcÅÄÖåäö"
20 FOR I=1 TO LEN(X)
30 C$ = MID$(X, I, 1)
40 PRINT C$; " => "; ASCII(C$)
50 NEXT I
--------
A => 65
B => 66
C => 67
a => 97
b => 98
c => 99
Å => 197
Ä => 196
Ö => 214
å => 229
ä => 228
ö => 246