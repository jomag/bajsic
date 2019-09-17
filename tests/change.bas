--- skip ---
10 DIM arrayChanges(6)
20 ABCD = "ABCD"
30 CHANGE ABCD TO arrayChanges
40 FOR I% = 0 TO 4
50 PRINT arrayChanges(I%)
60 NEXT I%
70 CHANGE arrayChanges TO A
80 PRINT A
---------------
4
65
66
67
68
ABCD
